import { Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Prompt } from './schemas/prompt.schema';
import * as PROMPTS from './prompts.json';

@Injectable()
export class PromptService implements OnModuleInit {
  constructor(@InjectModel(Prompt.name) private promptModel: Model<Prompt>) {}

  async onModuleInit(): Promise<void> {
    console.log('Initializing PromptService');
    await this.initialize();
  }

  public async initialize(): Promise<void> {
    for (const [key, value] of Object.entries(PROMPTS)) {
      const prompt = { name: key, content: value };
      const existingPrompt = await this.promptModel.findOne({ name: prompt.name });

      if (!existingPrompt) {
        console.log('Creating prompt: ', prompt.name);
        const newPrompt = new this.promptModel(prompt);
        await newPrompt.save();
      }
    }
  }

  public async get(name: string): Promise<string> {
    const prompt = await this.promptModel.findOne({ name });

    if (prompt && prompt.content) {
      return prompt.content;
    }

    throw new Error(`Prompt not found: ${name}`);
  }
}
