import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { Session, SessionStatus } from './schemas/session.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSessionDto } from './dtos/create-session.dto';
import { Message, Roles } from 'src/chat/schemas/message.schema';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { PromptService } from 'src/prompt/prompt.service';
import { Classroom } from 'src/classroom/schemas/classroom.schema';
import { ClassroomService } from 'src/classroom/classroom.service';

const MAX_TOKENS = 800;
const DEFAULT_MODEL = 'DEFAULT_MODEL';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    private chatService: ChatService,
    private promptService: PromptService,
    private classroomService: ClassroomService,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    let classroom: Classroom;
    try {
      classroom = await this.classroomService.getById(createSessionDto.classroomId);
    } catch (error) {
      throw new HttpException(`Classroom not found: ${createSessionDto.classroomId}`, HttpStatus.BAD_REQUEST);
    }
    if (!classroom.persona) {
      throw new HttpException(
        `Persona not found for classroom: ${Object.values(createSessionDto)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (!classroom.topic) {
      throw new HttpException(
        `Topic not found for classroom: ${Object.values(createSessionDto)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const session = new this.sessionModel();
    session.userId = new mongoose.Types.ObjectId();
    const messages = await this.getSystemPrompts(classroom);
    const chat = await this.chatService.create(messages, session.userId, classroom.persona.voice);
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
      baseSystemPrompt = await this.promptService.getByName('base-system');
      levelPrompt = await this.promptService.getByName(`level-${classroom.level}`);
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
        levelPrompt = await this.promptService.getByName(`level-${session.classroom.level}`);
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
