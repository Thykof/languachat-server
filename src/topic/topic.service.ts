import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Topic } from './schemas/topic.schema';
import { Model } from 'mongoose';
import { PromptService } from 'src/prompt/prompt.service';
import slugify from 'slugify';

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
    const defaultTopicNames = ['Introduce Yourself', 'The routine', 'Food', 'Weather'];
    for (const name of defaultTopicNames) {
      const existingTopic = await this.topicModel.findOne({ name });
      if (!existingTopic) {
        console.log(`Creating topic: ${name}`);
        const topic = new this.topicModel();
        topic.name = name;
        topic.description = 'introduce yourself, physical and personality description';
        topic.prompt = `${topic.description}. ${await this.promptService.getByName(
          `topic-${slugify(name, { lower: true })}`,
        )}`;
        await topic.save();
      }
    }
  }

  public async getById(id: string): Promise<Topic> {
    const topic = await this.topicModel.findById(id);

    if (topic) {
      return topic;
    }

    throw new Error(`Topic not found: ${id}`);
  }

  public async get(filter: Partial<Topic>): Promise<Topic> {
    const topic = await this.topicModel.findOne(filter);

    if (topic) {
      return topic;
    }

    throw new Error(`Topic not found: ${Object.values(filter)}`);
  }

  public async findAll(): Promise<Topic[]> {
    return await this.topicModel.find().exec();
  }
}
