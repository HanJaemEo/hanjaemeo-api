import type { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OutputFixingParser, StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';
import { EnvService } from '#api/common/service/env/env.service';
import type { TranscribedData } from '../openai/openai.service';
import { KoreanMdxAgent } from './agent/korean-mdx-agent';
import { KoreanQaAgent } from './agent/korean-qa-agent';

@Injectable()
export class LangchainService {
  private readonly logger = new Logger(LangchainService.name);

  private readonly llm: ChatOpenAI;

  constructor(
    @Inject(EnvService) private readonly envService: EnvService,
    @Inject(KoreanMdxAgent) private readonly koeranMdxAgent: KoreanMdxAgent,
    @Inject(KoreanQaAgent) private readonly koreanQaAgent: KoreanQaAgent,
  ) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.envService.OpenaiApiKey,
      modelName: 'gpt-3.5-turbo',
      maxTokens: -1,
      temperature: 0.2,
    });
  }

  async generateMdx(transcribedData: TranscribedData): Promise<string> {
    const { segments, ...headerMetadata } = transcribedData;
    const koreanMdxAgent = await this.koeranMdxAgent.createAgentExecutor(
      JSON.stringify({
        duration: headerMetadata.duration,
        text: headerMetadata.text,
      }),
    );

    const chunkedSegments: (typeof segments)[] = [];
    for (let i = 0; i < segments.length; i += 10) {
      chunkedSegments.push(segments.slice(i, i + 10));
    }

    const schema = z.object({
      mdx: z.string({ description: 'The generated MDX.' }),
    });

    const mdxs = await Promise.all(
      chunkedSegments.map(async segments => {
        const res = await koreanMdxAgent.invoke({
          input: `
            Here is the video segment metadata json:
            \`\`\`json
            ${JSON.stringify({
              segments: segments.map(segment => ({
                id: segment.id,
                start: segment.start,
                end: segment.end,
                text: segment.text,
              })),
            })}
            \`\`\`
          `,
        });

        const { mdx } = await this.parseOutputAsStructure(res['output'], schema);

        return mdx;
      }),
    );

    return mdxs.join('\n');
  }

  async conversation(
    content: string,
    chatHistory: (AIMessage | HumanMessage)[],
    transcribedSentence: string,
    handleLLMNewToken: (token: string) => void | Promise<void>,
  ) {
    const KoreanQaAgent = await this.koreanQaAgent.createAgentExecutor(transcribedSentence);

    const agentResponse = await KoreanQaAgent.invoke(
      {
        input: content,
        chat_history: chatHistory,
      },
      {
        callbacks: [{ handleLLMNewToken }],
      },
    );

    return agentResponse['output'];
  }

  private async parseOutputAsStructure<T>(output: string, zodSchema: z.Schema<T>) {
    const structuredOutputParser = StructuredOutputParser.fromZodSchema(zodSchema);

    const parsedOutput = await structuredOutputParser.parse(output).catch(async err => {
      this.logger.warn(`Failed to parse output: ${err.message}`);

      const outputFixingParser = OutputFixingParser.fromLLM(this.llm, structuredOutputParser);
      const parsedFixedOutput = await outputFixingParser.parse(output);

      return parsedFixedOutput;
    });

    return parsedOutput;
  }
}
