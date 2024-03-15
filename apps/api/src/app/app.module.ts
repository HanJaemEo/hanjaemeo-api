import { Module } from '@nestjs/common';
import { EnvModule } from '#api/common/service/env/env.module';
import { LangchainModule } from '#api/infra/langchain/langchain.module';
import { Modules } from '#api/module';

@Module({
  imports: [EnvModule, LangchainModule, ...Modules],
})
export class AppModule {}
