import fs from 'node:fs';
import { Inject, Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { EnvService } from '#api/common/service/env/env.service';

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAI;

  constructor(@Inject(EnvService) private readonly envService: EnvService) {
    this.openai = new OpenAI({ apiKey: this.envService.OpenaiApiKey });
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
}
