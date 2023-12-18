import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Chat } from './schemas/chat.schema';
import { ConfigService } from '@nestjs/config';
import { Voice } from 'src/persona/schemas/persona.schema';
import { ChatConfig, ChatModelName } from './schemas/chat-config.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, Roles } from './schemas/message.schema';

const OPENAI_API_KEY = 'OPENAI_API_KEY';
const ENABLE_SPEECH = 'ENABLE_SPEECH';
const DEFAULT_MODEL = 'DEFAULT_MODEL';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(ChatConfig.name) private chatConfigModel: Model<ChatConfig>,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get(OPENAI_API_KEY),
    });
  }

  enableSpeech: boolean;
  model: ChatModelName;

  onModuleInit(): void {
    console.log('Initializing ChatService');
    const enableSpeech = this.configService.get(ENABLE_SPEECH);
    if (enableSpeech === 'true') {
      this.enableSpeech = true;
    } else {
      this.enableSpeech = false;
    }
    console.log('Enable speech: ', this.enableSpeech);

    const modelInEnv = this.configService.get(DEFAULT_MODEL);
    if (modelInEnv && (Object.values(ChatModelName) as unknown[]).includes(modelInEnv)) {
      this.model = modelInEnv;
    } else {
      console.log(`invalid model in env var '${modelInEnv}' using default model`);
      this.model = ChatModelName.GPT4Turbo;
    }
    console.log('Using model: ', this.model);
  }

  public async create(initialMessages: Message[], userId: Types.ObjectId, voice: Voice): Promise<Chat> {
    const chat = new this.chatModel();
    const chatConfig = new this.chatConfigModel();
    chatConfig.chatModelName = this.model;
    chatConfig.temperature = 0.6;
    chatConfig.frequencyPenalty = 1;
    chatConfig.presencePenalty = 1;
    chat.config = chatConfig;
    chat.messages = initialMessages;
    const firstMessage = await this.generateResponse(chat, userId.toString());
    const firstMessageContent = firstMessage.choices[0].message.content;
    chat.messages.push(
      new Message({
        content: firstMessageContent,
        role: Roles.Assistant,
        speech: await this.toSpeech(firstMessageContent, voice),
      }),
    );
    chat.tokenCount = 0; // start with 0 because we update with the total tokens used after each response
    return chat;
  }

  public async generateResponse(chat: Chat, userId: string): Promise<OpenAI.ChatCompletion> {
    const response = await this.openai.chat.completions.create({
      messages: chat.messages.map((message) => {
        delete message.speech;
        return message;
      }) as OpenAI.ChatCompletionMessageParam[],
      model: chat.config.chatModelName,
      frequency_penalty: chat.config.frequencyPenalty,
      presence_penalty: chat.config.presencePenalty,
      temperature: chat.config.temperature,
      user: userId.toString(),
    });

    if (response.usage) {
      chat.tokenCount = response.usage.total_tokens;
    } else {
      console.warn('No usage data in response');
    }

    return response;
  }

  public async toSpeech(message: string, voice: Voice): Promise<Buffer> {
    if (this.enableSpeech === false) {
      return;
    }
    const audio = await this.openai.audio.speech.create({
      model: ChatModelName.TTS1,
      voice,
      input: message,
    });

    return Buffer.from(await audio.arrayBuffer());
  }
}
