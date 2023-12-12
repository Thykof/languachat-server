import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Prompt, PromptSchema } from './schemas/prompt.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Prompt.name, schema: PromptSchema }])],
  providers: [PromptService],
  exports: [PromptService],
})
export class PromptModule {}
