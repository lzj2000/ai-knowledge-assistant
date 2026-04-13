export type MessageRole = 'user' | 'assistant';

export interface MessageSource {
  document_id: string;
  document_title: string;
  chunk_id: string;
  content: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  sources: MessageSource[] | null;
  created_at: string;
}

export interface CreateMessageInput {
  conversation_id: string;
  role: MessageRole;
  content: string;
  sources?: MessageSource[];
}