import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Classroom, Language, Level } from './schemas/classroom.schema';
import { Model } from 'mongoose';
import { PersonaService } from 'src/persona/persona.service';
import { PromptService } from 'src/prompt/prompt.service';
import { TopicService } from 'src/topic/topic.service';
import { Topic } from 'src/topic/schemas/topic.schema';
import { Persona } from 'src/persona/schemas/persona.schema';
import { CreateClassroomDto } from './dtos/create-classroom.dto';

const DEFAULTS_CLASSROOM_NAME = 'default';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
    private personaService: PersonaService,
    private promptService: PromptService,
    private topicService: TopicService,
  ) {}

  public async findAll(): Promise<Classroom[]> {
    return await this.classroomModel.find().populate(['persona', 'topic']).exec();
  }

  public async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    const classroom = new this.classroomModel();

    classroom.name = createClassroomDto.name;

    let language: Language | undefined;
    classroom.language = language;
    if ((Object.values(Language) as unknown[]).includes(createClassroomDto.language)) {
      language = createClassroomDto.language as Language;
    } else {
      throw new HttpException(`Invalid language: ${createClassroomDto.language}`, 400);
    }
    classroom.language = language;

    let persona: Persona;
    try {
      persona = await this.personaService.getById(createClassroomDto.personaId);
    } catch (error) {
      throw new HttpException(`Persona not found: ${createClassroomDto.personaId}`, 400);
    }
    classroom.persona = persona;

    let level: Level | undefined;
    if ((Object.values(Level) as unknown[]).includes(createClassroomDto.level)) {
      level = createClassroomDto.level as Level;
    } else {
      throw new HttpException(`Invalid level: ${createClassroomDto.level}`, 400);
    }
    classroom.level = level;

    let topic: Topic;
    try {
      topic = await this.topicService.getById(createClassroomDto.topicId);
    } catch (error) {
      throw new HttpException(`Topic not found: ${createClassroomDto.topicId}`, 400);
    }
    classroom.topic = topic;

    let finalSystemMessage: string;
    try {
      finalSystemMessage = await this.promptService.getByName('final-system');
    } catch (error) {
      throw new HttpException(`Prompt not found: final-system`, 400);
    }
    classroom.finalSystemMessage = finalSystemMessage;

    return await classroom.save();
  }

  public async getById(id: string): Promise<Classroom> {
    const classroom = await this.classroomModel.findById(id).populate(['persona', 'topic']).exec();
    if (!classroom) {
      throw new HttpException(`Classroom not found: ${id}`, 404);
    }

    return classroom;
  }
}
