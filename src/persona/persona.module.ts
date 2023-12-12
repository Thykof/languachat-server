import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Persona, PersonaSchema } from './schemas/persona.schema';
import { PromptModule } from 'src/prompt/prompt.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Persona.name, schema: PersonaSchema }]), PromptModule],
  providers: [PersonaService],
  exports: [PersonaService],
})
export class PersonaModule {}
