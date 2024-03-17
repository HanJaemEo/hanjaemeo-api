import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { EnvService } from '#api/common/service/env/env.service';
import { searchTool } from './tool/search';

@Injectable()
export class KoreanMdxAgent {
  private readonly llm: ChatOpenAI;

  constructor(@Inject(EnvService) private readonly envService: EnvService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.envService.OpenaiApiKey,
      modelName: 'gpt-4-turbo-preview',
      maxTokens: -1,
      temperature: 0.2,
    });
  }

  async createAgentExecutor(videoHeaderMetadataJson: string) {
    const agent = await createOpenAIToolsAgent({
      llm: this.llm,
      tools: [searchTool],
      prompt: ChatPromptTemplate.fromMessages([
        new SystemMessage({
          content: `
            You are a Korean language expert and have been tasked to generate an MDX format from a JSON structure representing the metadata for a video given by the user.
            Your goal is to process this metadata, focusing on the detected text segments, and organize these segments into MDX format.

            The metadata for the video has the following JSON structure:
            \`\`\`ts
            type VideoMetadata =
              /** Header metadata for the video */
              | {
                  /** Video length (sec) */
                  duration: number;
                  /** Text detected in the video */
                  text: string;
                }
              /** Metadata for each segment */
              | {
                  /** Metadata for each segment of detected sentences */
                  segments: {
                    /** Segment ID */
                    id: number;
                    /** Start time of segment */
                    start: number;
                    /** End time of segment */
                    end: number;
                    /** Sentences detected in segment */
                    text: string;
                  }[];
                };
            \`\`\`

            The MDX must include the following elements for each segment:
            - A \`<Timestamp />\` component representing the start time of the segment.
            - The parts-of-speech components that further divides the sentences detected in the segment.
              - The children of each parts-of-speech components consist of the Korean word and its Japanese translation in ruby.
              - Between each parts-of-speech component, a \`<Space />\` component is inserted.
            - A blockquote containing the Japanese translation of the sentences detected in the segment.

            The following parts-of-speech are support:
            - noun: \`<Noun>\`
            - verb: \`<Verb>\`
            - adjective: \`<Adjective>\`
            - particle: \`<Particle>\`
            - adverb: \`<Adverb>\`
            - pronoun: \`<Pronoun>\`
            - determiner: \`<Determiner>\`
            - numeral: \`<Numeral>\`
            - interjection: \`<Interjection>\`
            - unclassified: \`<Unclassified>\`
            - whitespace: \`<Space>\`

            The example of the MDX to be generated:
            \`\`\`mdx
            <Timestamp t="88.123" />

            <p>
              <Noun>[유행]^(流行)</Noun>
              <Particle>[이]^(が)</Particle>
              <Space />
              <Verb>[돌고]^(回り)</Verb>
              <Space />
              <Verb>[돌아도]^(回っても)</Verb>
              <Space />
              <Pronoun>[난]^(私は)</Pronoun>
              <Space />
              <Determiner>[그]^(その)</Determiner>
              <Space />
              <Noun>[틀]^(枠)</Noun>
              <Particle>[에]^(に)</Particle>
              <Space />
              <Verb>[없어]^(いない)</Verb>
              <Space />
              <Adverb>[이미]^(もう)</Adverb>
            </p>

            > 流行が回り回っても、私はもうその枠にいないの
            \`\`\`

            The final output should follow the following JSON structure:
            \`\`\`ts
            type Result = {
              mdx: string;
            };
            \`\`\`
           `,
        }),
        new HumanMessage({
          content: `
            Here is the video header metadata json:
            \`\`\`json
            ${videoHeaderMetadataJson}
            \`\`\`
          `,
        }),
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
