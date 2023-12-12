import { Get, UseInterceptors, ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { Persona } from './schemas/persona.schema';

@Controller('personas')
@UseInterceptors(ClassSerializerInterceptor)
export class PersonaController {
  constructor(private personaService: PersonaService) {}

  @Get()
  async findAll() {
    const personas = await this.personaService.findAll();
    return personas.map((persona) => {
      return new Persona({
        name: persona.name,
        description: persona.description,
        voice: persona.voice,
      });
    });
  }
}
