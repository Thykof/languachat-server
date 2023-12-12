import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat, ChatConfig, ChatConfigSchema, ChatSchema } from './schemas/chat.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: ChatConfig.name, schema: ChatConfigSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
