import fs from 'node:fs';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import type { TranscribedData } from '#api/infra/openai/openai.service';

export const createSearchVideoTranscribedDataTool = async (transcribedDataPath: string) => {
  const transcribedData = JSON.parse(fs.readFileSync(transcribedDataPath, { encoding: 'utf-8' })) as TranscribedData;

  const textSplitter = new CharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  });

  const documents = await textSplitter.createDocuments(
    transcribedData.segments.map(segment =>
      JSON.stringify({
        start: segment.start,
        end: segment.end,
        text: segment.text,
      }),
    ),
  );

  const embeddings = new OpenAIEmbeddings();
  const db = await MemoryVectorStore.fromDocuments(documents, embeddings);

  const searchVideoTranscribedData = createRetrieverTool(db.asRetriever(), {
    name: 'search-video-transcribed-data',
    description:
      'Searches for and returns transcriptions of videos in Korean. This data includes timestamps for each segment. The query must be in Korean.',
  });

  return searchVideoTranscribedData;
};
