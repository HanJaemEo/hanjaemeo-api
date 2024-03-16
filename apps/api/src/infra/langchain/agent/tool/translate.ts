import { DynamicStructuredTool } from '@langchain/core/tools';
import type { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { z } from 'zod';

export const createTranslateTool = (llm: ChatOpenAI<ChatOpenAICallOptions>) => {
  const translateTool = new DynamicStructuredTool({
    name: 'translate-from-any-language-to-korean',
    description: 'Translates a sentence from any language to Korean.',
    schema: z.object({
      sentence: z.string().describe('A sentence to be translated, written in some language.'),
    }),
    func: async ({ sentence }) => {
      const res = await llm.invoke(`
        Translate the following sentence to Korean:
        ${sentence}
      `);

      return res.content.toString();
    },
  });

  return translateTool;
};
