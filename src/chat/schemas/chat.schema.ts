import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Message } from './message.schema';
import { Exclude } from 'class-transformer';
import { ChatConfig } from './chat-config.schema';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat {
  constructor(partial: Partial<Chat>) {
    Object.assign(this, partial);
  }

  @Exclude()
  @Prop()
  config: ChatConfig;

  @Prop()
  messages: Message[];

  @Exclude()
  @Prop()
  tokenCount: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
