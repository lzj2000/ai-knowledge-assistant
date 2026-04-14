import type { Message } from '@/types/message';
import { retrieveRelevantChunks, chunksToSources } from '@/lib/rag/retrieval';
import { buildRAGPrompt, buildConversationPrompt } from '@/lib/llm/prompts';

interface PrepareOptions {
  question: string;
  history: Message[];
  documentId?: string;
}

export async function prepareKnowledgeAnswer(options: PrepareOptions) {
  const { question, history, documentId } = options;

  // 执行向量检索，支持按文档过滤
  const chunks = await retrieveRelevantChunks(question, { documentId, limit: 10 });
  const sources = chunksToSources(chunks);

  // 构建上下文文本
  const contextText = chunks.map((c) => `[${c.document_title ?? '未知文档'}]\n${c.content}`).join('\n\n');

  // 拼装历史对话
  const historyText = history
    .slice(-6) // 只取最近 6 条作为上下文
    .map((m) => `${m.role === 'user' ? '用户' : '助手'}：${m.content}`)
    .join('\n');

  // 组合 prompt
  const prompt = history.length > 0
    ? buildConversationPrompt(historyText, buildRAGPrompt(contextText, question))
    : buildRAGPrompt(contextText, question);

  return { prompt, sources };
}