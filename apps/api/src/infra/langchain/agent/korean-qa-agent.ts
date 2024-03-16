import { SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { EnvService } from '#api/common/service/env/env.service';
import { searchTool } from './tool/search';

@Injectable()
export class KoreanQaAgent {
  private readonly llm: ChatOpenAI;

  constructor(@Inject(EnvService) private readonly envService: EnvService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.envService.OpenaiApiKey,
      modelName: 'gpt-4-turbo-preview',
      maxTokens: -1,
      streaming: true,
    });
  }

  async createAgentExecutor(koreanSentence: string) {
    const agent = await createOpenAIToolsAgent({
      llm: this.llm,
      tools: [searchTool],
      prompt: ChatPromptTemplate.fromMessages([
        new SystemMessage({
          content: `
            You are the assistant bot for 한잼어 (HanJaemEo), an application for Japanese people to learn Korean through video.
            Assist the user based on the Korean video transcription below:
            ${koreanSentence}

            You can for example, but not limited to:
            - Japanese translation of transcripts
            - Summarize the transcription
            - Explanation of parts of speech
            - Searching for similar terms
           `,
        }),
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad'),
      ]),
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools: [searchTool],
    });

    return agentExecutor;
  }
}
