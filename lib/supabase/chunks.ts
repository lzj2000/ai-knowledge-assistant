import { supabaseAdmin } from './client';
import { DocumentChunk, CreateChunkInput } from '@/types/chunk';

export async function createChunks(inputs: CreateChunkInput[]): Promise<DocumentChunk[]> {
  const { data, error } = await supabaseAdmin
    .from('document_chunks')
    .insert(inputs)
    .select();

  if (error) throw error;
  return data;
}

export async function getChunksByDocument(documentId: string): Promise<DocumentChunk[]> {
  const { data, error } = await supabaseAdmin
    .from('document_chunks')
    .select('*')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function deleteChunksByDocument(documentId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('document_chunks')
    .delete()
    .eq('document_id', documentId);

  if (error) throw error;
}

export async function searchSimilarChunks(
  embedding: number[],
  options?: { limit?: number; threshold?: number }
): Promise<DocumentChunk[]> {
  const limit = options?.limit || 5;
  const threshold = options?.threshold || 0.7;

  // 使用pgvector进行相似度搜索
  const { data, error } = await supabaseAdmin.rpc('search_chunks', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) throw error;
  return data || [];
}