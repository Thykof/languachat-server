import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Chat } from 'src/chat/schemas/chat.schema';
import { Types, SchemaTypes } from 'mongoose';
import { Classroom } from 'src/classroom/schemas/classroom.schema';
import { Exclude } from 'class-transformer';
import { Transform } from 'class-transformer';
import { Roles } from 'src/chat/schemas/message.schema';

export type SessionDocument = HydratedDocument<Session>;

export enum SessionStatus {
  Active = 'active',
  Ended = 'ended',
}

@Schema()
export class Session {
  constructor(partial: Partial<Session>) {
    Object.assign(this, partial);
  }

  @Transform((param) => {
    const classroom = param.value as Classroom;
    return new Classroom({
      name: classroom.name,
      topic: classroom.topic,
      language: classroom.language,
      level: classroom.level,
      persona: classroom.persona,
    });
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' })
  classroom: Classroom;

  @Transform((param) => {
    const chat = param.value as Chat;
    return new Chat({
      config: chat.config,
      messages: chat.messages.filter((message) => message.role !== Roles.System),
      tokenCount: chat.tokenCount,
    });
  })
  @Prop()
  chat: Chat;

  @Prop({ type: String, enum: SessionStatus })
  status: SessionStatus;

  @Exclude()
  @Prop()
  maxToken: number;

  @Exclude()
  @Prop({ type: SchemaTypes.ObjectId })
  userId: Types.ObjectId;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
