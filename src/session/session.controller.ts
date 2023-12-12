import { Body, ClassSerializerInterceptor, Controller, Post, Put, UseInterceptors } from '@nestjs/common';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto } from './dtos/update-session.dto';
import { SessionService } from './session.service';
import { Session } from './schemas/session.schema';

@Controller('sessions')
@UseInterceptors(ClassSerializerInterceptor)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto): Promise<Session> {
    const session = await this.sessionService.create(createSessionDto);
    return new Session({
      classroom: session.classroom,
      chat: session.chat,
      status: session.status,
      maxToken: session.maxToken,
      userId: session.userId,
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put()
  async update(@Body() updateSessionDto: UpdateSessionDto) {
    return await this.sessionService.update(updateSessionDto);
  }
}
