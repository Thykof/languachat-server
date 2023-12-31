import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './schemas/topic.schema';
import { PromptModule } from 'src/prompt/prompt.module';
import { TopicController } from './topic.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]), PromptModule],
  providers: [TopicService],
  exports: [TopicService],
  controllers: [TopicController],
})
export class TopicModule {}
