import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { ChatModule } from 'src/chat/chat.module';
import { Chat, ChatSchema } from 'src/chat/schemas/chat.schema';
import { PromptModule } from 'src/prompt/prompt.module';
import { Classroom, ClassroomSchema } from 'src/classroom/schemas/classroom.schema';
import { Persona, PersonaSchema } from 'src/persona/schemas/persona.schema';
import { ClassroomModule } from 'src/classroom/classroom.module';
import { Topic, TopicSchema } from 'src/topic/schemas/topic.schema';
import { ChatConfig, ChatConfigSchema } from 'src/chat/schemas/chat-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    MongooseModule.forFeature([{ name: Classroom.name, schema: ClassroomSchema }]),
    MongooseModule.forFeature([{ name: Persona.name, schema: PersonaSchema }]),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: ChatConfig.name, schema: ChatConfigSchema }]),
    MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
    ClassroomModule,
    ChatModule,
    PromptModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
