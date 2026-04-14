import { z } from 'zod';
import type { UIMessage } from 'ai';
// MessageSource 类型在 sourcePartSchema 的 infer 中使用

export const sourcePartSchema = z.object({
  document_id: z.string(),
  document_title: z.string(),
  chunk_id: z.string(),
  content: z.string()
});

export const conversationPartSchema = z.object({
  conversationId: z.string()
});

export type KnowledgeMessageMetadata = {
  conversationId?: string;
};

export type KnowledgeDataPartMap = {
  sources: z.infer<typeof sourcePartSchema>[];
  conversation: z.infer<typeof conversationPartSchema>;
};

export type KnowledgeUIMessage = UIMessage<KnowledgeMessageMetadata, KnowledgeDataPartMap>;

// API 路由请求体类型
export interface ChatRequestBody {
  message: KnowledgeUIMessage;
  conversationId?: string;
  documentId?: string;
}