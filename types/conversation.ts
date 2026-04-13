export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

export interface CreateConversationInput {
  title?: string;
}

export interface UpdateConversationInput {
  title?: string;
}