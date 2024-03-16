import fs from 'node:fs';
import { Inject, Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { EnvService } from '#api/common/service/env/env.service';

export type TranscribedData = {
  duration: number;
  text: string;
  segments: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
};

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAI;

  constructor(@Inject(EnvService) private readonly envService: EnvService) {
    this.openai = new OpenAI({ apiKey: this.envService.OpenaiApiKey });
  }

  async transcribeToFile(audioFilePath: string): Promise<string> {
    if (this.isAlreadyTranscribed(audioFilePath)) {
      return audioFilePath.replace(/\.\w+$/, '.json');
    }

    const res = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      timestamp_granularities: ['segment'],
      response_format: 'verbose_json',
      file: fs.createReadStream(audioFilePath),
    });

    const metadataJsonPath = audioFilePath.replace(/\.\w+$/, '.json');
    fs.writeFileSync(metadataJsonPath, JSON.stringify(res, null, 2), { encoding: 'utf-8' });

    return metadataJsonPath;
  }

  private isAlreadyTranscribed(audioFilePath: string): boolean {
    const transcribed = fs.existsSync(audioFilePath.replace(/\.\w+$/, '.json'));

    return transcribed;
  }
}
