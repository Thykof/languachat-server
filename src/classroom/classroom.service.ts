import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Classroom, Language, Level } from './schemas/classroom.schema';
import { Model } from 'mongoose';
import { MONICA_NAME, PersonaService } from 'src/persona/persona.service';
import { PromptService } from 'src/prompt/prompt.service';
import { INTRODUCE_YOURSELF_TOPIC_NAME, TopicService } from 'src/topic/topic.service';

const DEFAULTS_CLASSROOM_NAME = 'default';

@Injectable()
export class ClassroomService implements OnModuleInit {
  constructor(
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
    private personaService: PersonaService,
    private promptService: PromptService,
    private topicService: TopicService,
  ) {}

  async onModuleInit() {
    console.log('Initializing ClassroomService');
    await this.initialize();
  }

  public async initialize(): Promise<void> {
    for (const language of Object.values(Language) as Language[]) {
      const existingClassroom = await this.classroomModel.findOne({ language }).exec();
      if (!existingClassroom) {
        console.log(`Creating classroom for language ${language}`);
        const classroom = new this.classroomModel();
        classroom.name = DEFAULTS_CLASSROOM_NAME;
        classroom.topic = await this.topicService.get(INTRODUCE_YOURSELF_TOPIC_NAME);
        classroom.language = language;
        classroom.level = Level.Beginner;
        classroom.persona = await this.personaService.get(MONICA_NAME);
        classroom.finalSystemMessage = await this.promptService.get('final-system');
        await classroom.save();
      }
    }
  }

  public async findAll(): Promise<Classroom[]> {
    return await this.classroomModel.find().populate(['persona', 'topic']).exec();
  }
}
