import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PromptDocument = HydratedDocument<Prompt>;

@Schema()
export class Prompt {
  @Prop()
  name: string;

  @Prop()
  content: string;
}

export const PromptSchema = SchemaFactory.createForClass(Prompt);
