import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Exclude, Transform } from 'class-transformer';

export type TopicDocument = HydratedDocument<Topic>;

@Schema()
export class Topic {
  constructor(partial: Partial<Topic>) {
    Object.assign(this, partial);
  }

  @Transform((params) => params.obj._id.toString())
  _id: Types.ObjectId;

  // The user chose the topic by the name, the name is in the first assistant message
  @Prop()
  name: string;

  // The description helps the user to chose the topic
  @Prop()
  description: string;

  // The prompt is in the system message
  @Exclude()
  @Prop()
  prompt: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
