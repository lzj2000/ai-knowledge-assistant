import { supabaseAdmin } from './client';
import { Document, CreateDocumentInput, UpdateDocumentInput } from '@/types/document';

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDocument(id: string): Promise<Document | null> {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getDocuments(options?: {
  categoryId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Document[]> {
  let query = supabaseAdmin
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function updateDocument(id: string, input: UpdateDocumentInput): Promise<Document> {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}