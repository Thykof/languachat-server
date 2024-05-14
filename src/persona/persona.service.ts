import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Persona, Voice } from './schemas/persona.schema';
import { Model } from 'mongoose';
import { PromptService } from 'src/prompt/prompt.service';

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
    const defaultPersonaNames = ['Monica', 'Pierre', 'Jason'];
    for (const name of defaultPersonaNames) {
      const existingPersona = await this.personaModel.findOne({ name });
      if (!existingPersona) {
        console.log(`Creating persona: ${name}`);
        const monica = new this.personaModel();
        monica.name = name;
        monica.description = '';
        monica.prompt = await this.promptService.getByName(`persona-${name.toLowerCase()}-description`);
        monica.voice = name === 'Monica' ? Voice.Nova : name === 'Jason' ? Voice.Onyx : Voice.Echo;
        await monica.save();
      }
    }
  }

  public async getById(id: string): Promise<Persona> {
    const persona = await this.personaModel.findById(id);

    return persona;
  }

  public async findAll(): Promise<Persona[]> {
    return await this.personaModel.find().exec();
  }
}
