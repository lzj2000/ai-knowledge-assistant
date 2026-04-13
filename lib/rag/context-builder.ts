import { RetrievedChunk } from './retrieval';
import { Message } from '@/types/message';

export function buildContextFromChunks(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      return `[${index + 1}] 来源：${chunk.document_title}\n${chunk.content}`;
    })
    .join('\n\n---\n\n');
}

export function buildHistoryContext(messages: Message[], maxRounds: number = 5): string {
  const recentMessages = messages.slice(-maxRounds * 2);

  return recentMessages
    .map(msg => {
      const role = msg.role === 'user' ? '用户' : '助手';
      return `${role}: ${msg.content}`;
    })
    .join('\n');
}

export function buildFullContext(
  chunks: RetrievedChunk[],
  messages: Message[],
  question: string
): { context: string; history: string; question: string } {
  const context = buildContextFromChunks(chunks);
  const history = buildHistoryContext(messages);

  return { context, history, question };
}