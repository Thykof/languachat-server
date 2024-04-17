import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum ChatModelName {
  GPT4Turbo = 'gpt-4-turbo',
  GPT4 = 'gpt4',
  GPT432k = 'gpt-4-32k',
  GPT35 = 'gpt-3.5-turbo',
  GPT3516k = 'gpt-3.5-turbo-16k',
  TTS1 = 'tts-1',
}

@Schema()
export class ChatConfig {
  @Prop()
  chatModelName: ChatModelName;

  @Prop()
  temperature: number;

  @Prop()
  frequencyPenalty: number;

  @Prop()
  presencePenalty: number;
}

export const ChatConfigSchema = SchemaFactory.createForClass(ChatConfig);
