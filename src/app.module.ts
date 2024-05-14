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
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

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
    AuthModule,
    UserModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
