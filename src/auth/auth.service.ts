import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generateFromEmail } from 'unique-username-generator';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { JWT_SECRET } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  generateJwt(payload) {
    return this.jwtService.sign(payload, { secret: this.configService.get(JWT_SECRET) });
  }

  async signIn(user: User) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.findUserByEmail(user.email);

    if (!userExists) {
      return this.registerUser(user);
    }

    return this.generateJwt({
      sub: userExists._id,
      email: userExists.email,
    });
  }

  async registerUser(user: RegisterUserDto) {
    try {
      const newUser = this.userService.create(user);
      newUser.username = generateFromEmail(user.email, 5);

      await newUser.save();

      console.log('newUser', newUser);

      return this.generateJwt({
        sub: newUser._id,
        email: newUser.email,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException("Couldn't register user");
    }
  }

  async findUserByEmail(email: string) {
    const user = await this.userService.get({ email });

    if (!user) {
      return null;
    }

    return user;
  }
}
