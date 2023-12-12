import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Classroom, ClassroomSchema } from './schemas/classroom.schema';
import { ClassroomService } from './classroom.service';
import { PromptModule } from 'src/prompt/prompt.module';
import { TopicModule } from 'src/topic/topic.module';
import { PersonaModule } from 'src/persona/persona.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Classroom.name, schema: ClassroomSchema }]),
    PromptModule,
    TopicModule,
    PersonaModule,
  ],
  providers: [ClassroomService],
  exports: [ClassroomService],
})
export class ClassroomModule {}
