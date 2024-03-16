import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  private readonly logger = new Logger(EnvService.name);

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.logger.log(`NODE_ENV: ${this.NodeEnv}`);
  }

  get NodeEnv(): 'development' | 'production' | 'test' {
    const nodeEnv = this.configService.get<'development' | 'production' | 'test'>('NODE_ENV', 'development');

    return nodeEnv;
  }

  get OpenaiApiKey(): string {
    const openaiApiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');

    return openaiApiKey;
  }

  get Port(): number {
    const port = this.configService.get<number>('PORT', 4000);

    return port;
  }
}
