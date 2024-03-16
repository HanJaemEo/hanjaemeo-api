import fs from 'node:fs';
import { ChatOpenAI } from '@langchain/openai';
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

  async llmCall(prompt: string, handleLLMNewToken: (token: string) => void | Promise<void>) {
    const stream = await this.llm.invoke(prompt, {
      callbacks: [{ handleLLMNewToken }],
    });

    return stream;
  }
}
