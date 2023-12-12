import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Persona, Voice } from './schemas/persona.schema';
import { Model } from 'mongoose';
import { PromptService } from 'src/prompt/prompt.service';

export const MONICA_NAME = 'Monica';

@Injectable()
export class PersonaService implements OnModuleInit {
  constructor(
    @InjectModel(Persona.name) private personaModel: Model<Persona>,
    private promptService: PromptService,
  ) {}

  async onModuleInit() {
    console.log('Initializing PersonaService');
    await this.initialize();
  }

  public async initialize(): Promise<void> {
    const existingPersona = await this.personaModel.findOne({ name: MONICA_NAME });
    if (!existingPersona) {
      console.log('Creating default persona');
      const monica = new this.personaModel();
      monica.name = MONICA_NAME;
      monica.description = '';
      monica.prompt = await this.promptService.get('persona-monica-description');
      monica.voice = Voice.Nova;
      await monica.save();
    }
  }

  public async get(name: string): Promise<Persona> {
    const persona = await this.personaModel.findOne({ name });

    if (persona) {
      return persona;
    }

    throw new Error(`Persona not found: ${name}`);
  }

  public async getAll(): Promise<Persona[]> {
    return await this.personaModel.find().exec();
  }
}
