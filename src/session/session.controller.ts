import { Body, ClassSerializerInterceptor, Controller, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { CreateSessionDto } from './dtos/create-session.dto';
import { UpdateSessionDto, UpdateSessionParams } from './dtos/update-session.dto';
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
      _id: session._id,
      classroom: session.classroom,
      chat: session.chat,
      status: session.status,
      maxToken: session.maxToken,
      userId: session.userId,
    });
  }

  @Put(':id')
  async update(@Param() params: UpdateSessionParams, @Body() updateSessionDto: UpdateSessionDto): Promise<Session> {
    const session = await this.sessionService.update(params.id, updateSessionDto);
    return new Session({
      _id: session._id,
      classroom: session.classroom,
      chat: session.chat,
      status: session.status,
      maxToken: session.maxToken,
      userId: session.userId,
    });
  }
}
