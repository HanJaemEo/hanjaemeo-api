import fs from 'node:fs';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { Body, Controller, Inject, Logger, Param, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { OpenaiService, type TranscribedData } from '#api/infra/openai/openai.service';
import { YoutubeService } from '#api/infra/youtube/youtube.service';
import { LangchainService } from './langchain.service';

class Message {
  role!: 'user' | 'assistant';
  content!: string;
}

@Controller()
export class LangchainController {
  private readonly logger = new Logger(LangchainController.name);

  constructor(
    @Inject(LangchainService)
    private readonly langchainService: LangchainService,
    @Inject(OpenaiService)
    private readonly openaiService: OpenaiService,
    @Inject(YoutubeService)
    private readonly youtubeService: YoutubeService,
  ) {}

  @Post('/analyze/')
  async transcribeYoutubeVideo(@Body('url') url: string) {
    this.logger.log(`${this.transcribeYoutubeVideo.name} called`);
    this.logger.debug(`Transcribing video: ${url}`);

    const audioFilePath = await this.youtubeService.saveVideoStreamToFile(url);

    const metadataJsonPath = await this.openaiService.transcribeToFile(audioFilePath);

    const transcribedData = JSON.parse(fs.readFileSync(metadataJsonPath, { encoding: 'utf-8' })) as TranscribedData;

    const mdx = await this.langchainService.generateMdx(transcribedData);

    return {
      id: /\/([^/]+)\.mp3$/.exec(audioFilePath)![1],
      mdx,
    };
  }

  @Post('/agents/:id/')
  async conversation(
    @Res() { raw: res }: FastifyReply,
    @Param('id') id: string,
    @Body('messages') messages: Message[],
  ) {
    this.logger.log(`${this.conversation.name} called`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    const transcribedData = JSON.parse(fs.readFileSync(`./tmp/${id}.json`, { encoding: 'utf-8' })) as TranscribedData;

    const chatHistory = messages.map(message =>
      message.role === 'user' ? new HumanMessage(message.content) : new AIMessage(message.content),
    );

    await this.langchainService.conversation(messages.at(-1)!.content, chatHistory, transcribedData.text, token => {
      res.write(token);
    });

    res.end();
  }
}
