import { Body, Controller, Get, Inject, Logger, Param, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { OpenaiService } from '#api/infra/openai/openai.service';
import { YoutubeService } from '../youtube/youtube.service';

class Message {
  role!: 'user' | 'assistant';
  content!: string;
}

@Controller()
export class LangchainController {
  private readonly logger = new Logger(LangchainController.name);

  constructor(
    @Inject(OpenaiService)
    private readonly openaiService: OpenaiService,
    @Inject(YoutubeService)
    private readonly youtubeService: YoutubeService,
  ) {}

  @Get('/predict/:id')
  async transcribeYoutubeVideo(@Param('id') id: string): Promise<string> {
    this.logger.log(`${this.transcribeYoutubeVideo.name} called`);
    this.logger.debug(`Transcribing video: https://www.youtube.com/watch?v=${id}`);

    const outputFilePath = await this.youtubeService.saveVideoStreamToFile(`https://www.youtube.com/watch?v=${id}`);

    const transcription = await this.openaiService.transcribeFromFile(outputFilePath);

    return transcription;
  }

  @Post('/call')
  async predict(@Res() { raw: res }: FastifyReply, @Body('messages') messages: Message[]) {
    this.logger.log(`${this.predict.name} called`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    await this.openaiService.llmCall(messages.at(-1)!.content, token => {
      res.write(token);
    });

    res.end();
  }
}
