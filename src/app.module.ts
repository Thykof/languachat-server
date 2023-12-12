import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionModule } from './session/session.module';
import { ConfigModule } from '@nestjs/config';
import { PromptModule } from './prompt/prompt.module';
import { TopicModule } from './topic/topic.module';
import { ClassroomModule } from './classroom/classroom.module';
import { PersonaModule } from './persona/persona.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    PromptModule,
    TopicModule,
    PersonaModule,
    ClassroomModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
