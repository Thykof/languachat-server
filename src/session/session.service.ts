import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { Session, SessionStatus } from './schemas/session.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSessionDto } from './dtos/create-session.dto';
import { Chat, ChatConfig, ChatModelName } from 'src/chat/schemas/chat.schema';
import { Roles } from 'src/chat/schemas/message.schema';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { PromptService } from 'src/prompt/prompt.service';
import { Classroom } from 'src/classroom/schemas/classroom.schema';

const MAX_TOKENS = 2048;

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
    @InjectModel(ChatConfig.name) private chatConfigModel: Model<ChatConfig>,
    private chatService: ChatService,
    private promptService: PromptService,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const classroom = await this.classroomModel
      .findById(createSessionDto.classroomId)
      .populate(['persona', 'topic'])
      .exec();
    if (!classroom) {
      throw new HttpException(`Classroom not found: ${createSessionDto.classroomId}`, HttpStatus.NOT_FOUND);
    }
    if (!classroom.persona) {
      throw new HttpException(`Persona not found for classroom: ${createSessionDto.classroomId}`, HttpStatus.NOT_FOUND);
    }
    if (!classroom.topic) {
      throw new HttpException(`Topic not found for classroom: ${createSessionDto.classroomId}`, HttpStatus.NOT_FOUND);
    }
    const session = new this.sessionModel();
    const chat = new this.chatModel();
    const chatConfig = new this.chatConfigModel();
    chatConfig.chatModelName = ChatModelName.GPT35;
    chatConfig.temperature = 1.3;
    chatConfig.frequencyPenalty = 1;
    chatConfig.presencePenalty = 1;
    chat.config = chatConfig;
    let baseSystemPrompt: string;
    let levelPrompt: string;
    let firstAssistantMessage: string;
    try {
      baseSystemPrompt = await this.promptService.get('base-system');
      levelPrompt = await this.promptService.get(`level-${classroom.level}`);
      firstAssistantMessage = await this.promptService.get(`first-assistant-${classroom.language}`);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const firstMessage = firstAssistantMessage.replace('{topic}', classroom.topic.name);
    chat.messages = [
      {
        content: `${classroom.persona.prompt}\n${baseSystemPrompt}\n${levelPrompt}\nThe topic of the session is: ${classroom.topic.prompt}.`,
        role: Roles.System,
        speech: null,
      },
      {
        content: firstMessage,
        role: Roles.Assistant,
        speech: await this.chatService.toSpeech(firstMessage, classroom.persona.voice),
      },
    ];
    chat.tokenCount = 0; // start with 0 because we update with the total tokens used after each response
    session.classroom = classroom;
    session.chat = chat;
    session.status = SessionStatus.Active;
    session.userId = new mongoose.Types.ObjectId();
    session.maxToken = MAX_TOKENS;
    await session.save();

    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    const session = await this.sessionModel
      .findById(id)
      .populate([
        'chat',
        {
          path: 'classroom',
          populate: {
            path: 'persona',
          },
        },
        {
          path: 'classroom',
          populate: {
            path: 'topic',
          },
        },
      ])
      .exec();

    if (!session) {
      throw new HttpException(`Session not found: ${id}`, HttpStatus.NOT_FOUND);
    }

    session.chat.messages.push({
      content: updateSessionDto.userMessage,
      role: Roles.User,
      speech: null,
    });

    if (session.classroom.finalSystemMessage && session.chat.tokenCount > session.maxToken) {
      session.chat.messages.push({ content: session.classroom.finalSystemMessage, role: Roles.System, speech: null });
      session.status = SessionStatus.Ended;
    }
    const assistantResponse = await this.chatService.generateResponse(session.chat, session.userId.toString());
    const content = assistantResponse.choices[0].message.content;
    const speech = await this.chatService.toSpeech(content, session.classroom.persona.voice);
    session.chat.messages.push({
      content,
      role: Roles.Assistant,
      speech,
    });

    await session.save();

    return session;
  }
}
