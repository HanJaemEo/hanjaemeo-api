import { Global, Module } from '@nestjs/common';
import { OpenaiModule } from '#api/infra/openai/openai.module';
import { YoutubeModule } from '#api/infra/youtube/youtube.module';
import { AgentModule } from './agent/agent.module';
import { LangchainController } from './langchain.controller';
import { LangchainService } from './langchain.service';

@Global()
@Module({
  imports: [OpenaiModule, YoutubeModule, AgentModule],
  controllers: [LangchainController],
  providers: [LangchainService],
  exports: [LangchainService],
})
export class LangchainModule {}
