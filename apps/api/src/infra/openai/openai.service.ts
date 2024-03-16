import fs from 'node:fs';
import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { OpenAI } from 'openai';
import { EnvService } from '#api/common/service/env/env.service';

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAI;

  private readonly llm: ChatOpenAI;

  constructor(@Inject(EnvService) private readonly envService: EnvService) {
    this.openai = new OpenAI({ apiKey: this.envService.OpenaiApiKey });

    this.llm = new ChatOpenAI({
      openAIApiKey: this.envService.OpenaiApiKey,
      modelName: 'gpt-3.5-turbo',
      maxTokens: 4096,
      temperature: 0.2,
      streaming: true,
    });
  }

  async transcribeFromFile(path: string): Promise<string> {
    const res = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      language: 'ko',
      timestamp_granularities: ['segment'],
      response_format: 'verbose_json',
      file: fs.createReadStream(path),
    });

    return res.text;
  }

  async llmCall(prompt: string, res: Response) {
    const stream = await this.llm.invoke(prompt, {
      callbacks: [
        {
          async handleLLMNewToken(token) {
            await res.write(token);
          },
        },
      ],
    });

    return stream;
  }
}
