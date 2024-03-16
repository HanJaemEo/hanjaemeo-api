import { Module } from '@nestjs/common';
import { KoreanMdxAgent } from './korean-mdx-agent';
import { KoreanQaAgent } from './korean-qa-agent';

@Module({
  providers: [KoreanMdxAgent, KoreanQaAgent],
  exports: [KoreanMdxAgent, KoreanQaAgent],
})
export class AgentModule {}
