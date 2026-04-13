import { supabaseAdmin } from './client';
import { Conversation, CreateConversationInput } from '@/types/conversation';
import { Message, CreateMessageInput } from '@/types/message';

export async function createConversation(input?: CreateConversationInput): Promise<Conversation> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert(input || {})
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getConversations(limit?: number): Promise<Conversation[]> {
  let query = supabaseAdmin
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function createMessage(input: CreateMessageInput): Promise<Message> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}