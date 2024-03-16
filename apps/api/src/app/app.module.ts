import { Module } from '@nestjs/common';
import { EnvModule } from '#api/common/service/env/env.module';
import { LangchainModule } from '#api/infra/langchain/langchain.module';

@Module({
  imports: [EnvModule, LangchainModule],
})
export class AppModule {}
