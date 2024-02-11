import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async get(filter: Partial<User>): Promise<User> {
    return this.userModel.findOne(filter).exec();
  }

  public create(user: Partial<User>): UserDocument {
    return new this.userModel(user);
  }
}
