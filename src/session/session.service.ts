import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { Session, SessionStatus } from './schemas/session.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSessionDto } from './dtos/create-session.dto';
import { Chat } from 'src/chat/schemas/chat.schema';
import { Message, Roles } from 'src/chat/schemas/message.schema';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { PromptService } from 'src/prompt/prompt.service';
import { Classroom } from 'src/classroom/schemas/classroom.schema';
import { ConfigService } from '@nestjs/config';
import { ChatConfig, ChatModelName } from 'src/chat/schemas/chat-config.schema';

const MAX_TOKENS = 1;
const DEFAULT_MODEL = 'DEFAULT_MODEL';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
    @InjectModel(ChatConfig.name) private chatConfigModel: Model<ChatConfig>,
    private chatService: ChatService,
    private promptService: PromptService,
    private configService: ConfigService,
  ) {}

  model: ChatModelName;

  onModuleInit(): void {
    console.log('Initializing SessionService');
    const modelInEnv = this.configService.get(DEFAULT_MODEL);
    if (modelInEnv && (Object.values(ChatModelName) as unknown[]).includes(modelInEnv)) {
      this.model = modelInEnv;
    } else {
      console.log(`invalid model in env var '${modelInEnv}' using default model`);
      this.model = ChatModelName.GPT4Turbo;
    }
    console.log('Using model: ', this.model);
  }

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const classroom = await this.classroomModel
      .findOne({
        language: createSessionDto.language,
      })
      .populate(['persona', 'topic'])
      .exec();
    if (!classroom) {
      throw new HttpException(`Classroom not found: ${Object.values(createSessionDto)}`, HttpStatus.NOT_FOUND);
    }
    if (!classroom.persona) {
      throw new HttpException(
        `Persona not found for classroom: ${Object.values(createSessionDto)}`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (!classroom.topic) {
      throw new HttpException(
        `Topic not found for classroom: ${Object.values(createSessionDto)}`,
        HttpStatus.NOT_FOUND,
      );
    }
    const session = new this.sessionModel();
    session.userId = new mongoose.Types.ObjectId();
    const chat = new this.chatModel();
    const chatConfig = new this.chatConfigModel();
    chatConfig.chatModelName = this.model;
    chatConfig.temperature = 0.6;
    chatConfig.frequencyPenalty = 1;
    chatConfig.presencePenalty = 1;
    chat.config = chatConfig;
    chat.messages = await this.getSystemPrompts(classroom);
    const firstMessage = await this.chatService.generateResponse(chat, session.userId.toString());
    const firstMessageContent = firstMessage.choices[0].message.content;
    chat.messages.push(
      new Message({
        content: firstMessageContent,
        role: Roles.Assistant,
        speech: await this.chatService.toSpeech(firstMessageContent, classroom.persona.voice),
      }),
    );
    chat.tokenCount = 0; // start with 0 because we update with the total tokens used after each response
    session.classroom = classroom;
    session.chat = chat;
    session.status = SessionStatus.Active;
    session.maxToken = MAX_TOKENS;
    await session.save();

    return session;
  }

  async getSystemPrompts(classroom: Classroom): Promise<Message[]> {
    let baseSystemPrompt: string;
    let levelPrompt: string;
    try {
      baseSystemPrompt = await this.promptService.get('base-system');
      levelPrompt = await this.promptService.get(`level-${classroom.level}`);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return [
      new Message({
        content: classroom.persona.prompt,
        role: Roles.System,
      }),
      new Message({
        content: baseSystemPrompt,
        role: Roles.System,
      }),
      new Message({
        content: `The topic of the session is: ${classroom.topic.prompt}.`,
        role: Roles.System,
      }),
      new Message({
        content: levelPrompt,
        role: Roles.System,
      }),
      new Message({
        content: `The language is ${classroom.language}.`,
        role: Roles.System,
      }),
    ];
  }

  async findOne(id: string): Promise<Session> {
    return this.sessionModel.findById(id).exec();
  }

  async findAll(): Promise<Session[]> {
    return this.sessionModel.find().exec();
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

    if (session.status === SessionStatus.Ended) {
      throw new HttpException(`Session has ended: ${id}`, HttpStatus.BAD_REQUEST);
    }

    session.chat.messages.push({
      content: updateSessionDto.userMessage,
      role: Roles.User,
      speech: null,
    });

    if (session.classroom.finalSystemMessage && session.chat.tokenCount > session.maxToken) {
      session.chat.messages.push({ content: session.classroom.finalSystemMessage, role: Roles.System, speech: null });
      session.status = SessionStatus.Ended;
    } else if (session.chat.messages.length % 5 === 0) {
      let levelPrompt: string;
      try {
        levelPrompt = await this.promptService.get(`level-${session.classroom.level}`);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      session.chat.messages.push(
        new Message({
          content: `The topic of the session is: ${session.classroom.topic.prompt}.`,
          role: Roles.System,
        }),
        new Message({
          content: levelPrompt,
          role: Roles.System,
        }),
      );
    }

    const assistantResponse = await this.chatService.generateResponse(session.chat, session.userId.toString());
    const content = assistantResponse.choices[0].message.content;
    const speech = await this.chatService.toSpeech(content, session.classroom.persona.voice);
    session.chat.messages.push(
      new Message({
        content,
        role: Roles.Assistant,
        speech,
      }),
    );

    await session.save();

    return session;
  }
}
