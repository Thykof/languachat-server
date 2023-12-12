import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Topic } from './schemas/topic.schema';
import { Model } from 'mongoose';
import { PromptService } from 'src/prompt/prompt.service';

export const INTRODUCE_YOURSELF_TOPIC_NAME = 'Introduce Yourself';

@Injectable()
export class TopicService implements OnModuleInit {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<Topic>,
    private promptService: PromptService,
  ) {}

  async onModuleInit() {
    console.log('Initializing TopicService');
    await this.initialize();
  }

  public async initialize(): Promise<void> {
    const existingTopic = await this.topicModel.findOne({ name: INTRODUCE_YOURSELF_TOPIC_NAME });
    if (!existingTopic) {
      const topic = new this.topicModel();
      topic.name = INTRODUCE_YOURSELF_TOPIC_NAME;
      topic.description = 'introduce yourself, physical and personality description';
      topic.prompt = `${topic.description}. ${await this.promptService.get('topic-introduce-yourself')}`;
      await topic.save();
    }
  }

  public async get(name: string): Promise<Topic> {
    const topic = await this.topicModel.findOne({ name });

    if (topic) {
      return topic;
    }

    throw new Error(`Topic not found: ${name}`);
  }

  public async findAll(): Promise<Topic[]> {
    return await this.topicModel.find().exec();
  }
}
