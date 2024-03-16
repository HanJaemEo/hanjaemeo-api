import fs from 'node:fs';
import { SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { EnvService } from '#api/common/service/env/env.service';
import type { TranscribedData } from '#api/infra/openai/openai.service';
import { searchTool } from './tool/search';
import { createSearchVideoTranscribedDataTool } from './tool/searchVideoTranscribedData';
import { createTranslateTool } from './tool/translate';

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

  async createAgentExecutor(transcribedDataPath: string) {
    const transcribedData = JSON.parse(fs.readFileSync(transcribedDataPath, { encoding: 'utf-8' })) as TranscribedData;
    const searchVideoTranscribedDataTool = await createSearchVideoTranscribedDataTool(transcribedDataPath);

    const translateTool = createTranslateTool(this.llm);

    const agent = await createOpenAIToolsAgent({
      llm: this.llm,
      tools: [searchVideoTranscribedDataTool, translateTool, searchTool],
      prompt: ChatPromptTemplate.fromMessages([
        new SystemMessage({
          content: `
            You are the assistant bot for 한잼어 (HanJaemEo), an application for Japanese people to learn Korean through video.
            Assist the user based on the Korean video transcription below:
            ${transcribedData.text}

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
      tools: [searchVideoTranscribedDataTool, translateTool, searchTool],
    });

    return agentExecutor;
  }
}
