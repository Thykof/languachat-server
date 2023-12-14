import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { ChatModule } from 'src/chat/chat.module';
import { PromptModule } from 'src/prompt/prompt.module';
import { ClassroomModule } from 'src/classroom/classroom.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    ClassroomModule,
    ChatModule,
    PromptModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
