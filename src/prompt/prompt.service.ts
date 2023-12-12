import { Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Prompt } from './schemas/prompt.schema';
import * as PROMPTS from './prompts.json';

@Injectable()
export class PromptService implements OnModuleInit {
  constructor(@InjectModel(Prompt.name) private promptModel: Model<Prompt>) {}

  async onModuleInit() {
    console.log('Initializing PromptService');
    await this.initialize();
  }

  public async initialize(): Promise<void> {
    Object.entries(PROMPTS)
      .map(([key, value]) => ({ name: key, content: value }))
      .forEach(async (prompt) => {
        const existingPrompt = await this.promptModel.findOne({ name: prompt.name });
        if (!existingPrompt) {
          console.log('Creating prompt: ', prompt.name);
          const newPrompt = new this.promptModel(prompt);
          await newPrompt.save();
        }
      });
  }

  public async get(name: string): Promise<string> {
    const prompt = await this.promptModel.findOne({ name });

    if (prompt) {
      return prompt.content;
    }

    throw new Error(`Prompt not found: ${name}`);
  }
}
