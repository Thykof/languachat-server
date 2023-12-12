import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Persona, PersonaSchema } from './schemas/persona.schema';
import { PromptModule } from 'src/prompt/prompt.module';
import { PersonaController } from './persona.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Persona.name, schema: PersonaSchema }]), PromptModule],
  providers: [PersonaService],
  exports: [PersonaService],
  controllers: [PersonaController],
})
export class PersonaModule {}
