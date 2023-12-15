import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Message, Roles } from './message.schema';
import { Exclude, Transform } from 'class-transformer';
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

  @Transform((param) => {
    const messages = param.value as Message[];
    return messages
      .filter((message) => message.role !== Roles.System)
      .map((message) => {
        return new Message({
          content: message.content,
          role: message.role,
          speech: message.speech,
        });
      });
  })
  @Prop()
  messages: Message[];

  @Exclude()
  @Prop()
  tokenCount: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
