import { Controller, Get, Inject, Logger, Param } from '@nestjs/common';
import { OpenaiService } from '#api/infra/openai/openai.service';
import { YoutubeService } from '../youtube/youtube.service';

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
}