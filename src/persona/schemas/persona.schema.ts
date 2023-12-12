import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Transform } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';

export type PersonaDocument = HydratedDocument<Persona>;

export enum Voice {
  Alloy = 'alloy',
  Echo = 'echo',
  Fable = 'fable',
  Onyx = 'onyx',
  Nova = 'nova',
  Shimmer = 'shimmer',
}

@Schema()
export class Persona {
  constructor(partial: Partial<Persona>) {
    Object.assign(this, partial);
  }

  @Transform((params) => params.obj._id.toString())
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Exclude()
  @Prop()
  prompt: string;

  @Exclude()
  @Prop({ type: String, enum: Voice })
  voice: Voice;
}

export const PersonaSchema = SchemaFactory.createForClass(Persona);
