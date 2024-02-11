import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @Transform((params) => params.obj._id.toString())
  _id: string;

  @Prop()
  provider: string;

  @Prop()
  providerId: string;

  @Prop()
  name: string;

  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  picture: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
