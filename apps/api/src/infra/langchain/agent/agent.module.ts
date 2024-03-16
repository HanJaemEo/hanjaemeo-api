import { Module } from '@nestjs/common';
import { KoreanMdxAgent } from './korean-mdx-agent';

@Module({
  providers: [KoreanMdxAgent],
  exports: [KoreanMdxAgent],
})
export class AgentModule {}
