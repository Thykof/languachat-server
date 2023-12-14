import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Persona } from 'src/persona/schemas/persona.schema';
import { Topic } from 'src/topic/schemas/topic.schema';
import { Transform } from 'class-transformer';
import { Exclude } from 'class-transformer';

export type ClassroomDocument = HydratedDocument<Classroom>;

export enum Level {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export enum Language {
  English = 'english',
  Spanish = 'spanish',
  French = 'french',
  German = 'german',
  Italian = 'italian',
  Portuguese = 'portuguese',
}

@Schema()
export class Classroom {
  constructor(partial: Partial<Classroom>) {
    Object.assign(this, partial);
  }

  @Transform((params) => params.obj._id.toString())
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Transform((param) => {
    const topic = param.value as Topic;
    if (!topic) {
      return null;
    }
    return new Topic({
      name: topic.name,
      description: topic.description,
    });
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' })
  topic: Topic;

  @Prop({ type: String, enum: Language })
  language: Language;

  @Prop({ type: String, enum: Level })
  level: Level;

  @Transform((param) => {
    const persona = param.value as Persona;
    if (!persona) {
      return null;
    }
    return new Persona({
      name: persona.name,
      description: persona.description,
      voice: persona.voice,
    });
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Persona' })
  persona: Persona;

  @Exclude()
  @Prop()
  finalSystemMessage: string;
}

export const ClassroomSchema = SchemaFactory.createForClass(Classroom);
