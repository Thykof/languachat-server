import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

export enum Roles {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

@Schema()
export class Message {
  constructor(partial: Partial<Message>) {
    Object.assign(this, partial);
  }

  @Prop()
  content: string;

  @Prop()
  role: Roles;

  @Prop()
  speech: Buffer;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
