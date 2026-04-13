import { retrieveRelevantChunks, chunksToSources, RetrievedChunk } from './retrieval';
import { buildContextFromChunks, buildHistoryContext } from './context-builder';
import { chatCompletion, streamChatCompletion } from '@/lib/llm/glm';
import { buildRAGPrompt, buildConversationPrompt } from '@/lib/llm/prompts';
import { Message, MessageSource } from '@/types/message';

export interface RAGResponse {
  answer: string;
  sources: MessageSource[];
}

export async function askQuestion(
  question: string,
  options?: {
    conversationHistory?: Message[];
    stream?: boolean;
  }
): Promise<RAGResponse | AsyncGenerator<string>> {
  // 1. 检索相关分块
  const chunks = await retrieveRelevantChunks(question);

  if (chunks.length === 0) {
    return {
      answer: '抱歉，我在现有文档中没有找到与您问题相关的内容。请尝试其他问题，或上传更多相关文档。',
      sources: [],
    };
  }

  // 2. 构建上下文
  const context = buildContextFromChunks(chunks);
  const history = options?.conversationHistory
    ? buildHistoryContext(options.conversationHistory)
    : '';

  // 3. 构建Prompt
  let prompt: string;
  if (history && options?.conversationHistory?.length && options.conversationHistory.length > 0) {
    prompt = buildConversationPrompt(history, question) + `\n\n参考资料：\n${context}`;
  } else {
    prompt = buildRAGPrompt(context, question);
  }

  // 4. 生成回答
  if (options?.stream) {
    return streamChatCompletion(prompt);
  }

  const answer = await chatCompletion(prompt);

  // 5. 构建返回结果
  return {
    answer,
    sources: chunksToSources(chunks),
  };
}

export { retrieveRelevantChunks } from './retrieval';
export { buildContextFromChunks, buildHistoryContext } from './context-builder';