import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Chat, ChatModelName } from './schemas/chat.schema';
import { ConfigService } from '@nestjs/config';
import { Voice } from 'src/persona/schemas/persona.schema';

const OPENAI_API_KEY = 'OPENAI_API_KEY';
const ENABLE_SPEECH = 'ENABLE_SPEECH';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get(OPENAI_API_KEY),
    });
  }

  enableSpeech: boolean;

  onModuleInit(): void {
    console.log('ChatService');
    const enableSpeech = this.configService.get(ENABLE_SPEECH);
    if (enableSpeech === 'true') {
      this.enableSpeech = true;
    } else {
      this.enableSpeech = false;
    }
    console.log('Enable speech: ', this.enableSpeech);
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
