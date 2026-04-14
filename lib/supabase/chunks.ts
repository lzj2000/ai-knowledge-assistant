import { supabaseAdmin } from './client';
import { DocumentChunk, CreateChunkInput } from '@/types/chunk';

// 搜索结果类型（包含相似度分数）
export interface SearchResult {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
}

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

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  documentId?: string;  // 新增：可选的文档范围过滤
}

/**
 * 搜索相似的文档分块
 * 使用 pgvector 进行向量相似度搜索，如果 RPC 失败则回退到内存搜索
 */
export async function searchSimilarChunks(
  embedding: number[],
  options?: SearchOptions
): Promise<SearchResult[]> {
  const limit = options?.limit || 10;
  const threshold = options?.threshold || 0.1;
  const documentId = options?.documentId;

  // 构造向量字符串格式 '[x1, x2, x3, ...]'
  const vectorString = `[${embedding.join(',')}]`;

  // 如果指定了 documentId，尝试使用按文档过滤的 RPC 函数
  if (documentId) {
    const { data, error } = await supabaseAdmin.rpc('search_chunks_by_doc', {
      query_vector_str: vectorString,
      match_threshold: threshold,
      match_count: limit,
      filter_document_id: documentId,
    });

    // 如果 RPC 成功且有数据，直接返回
    if (!error && data && data.length > 0) {
      return data as SearchResult[];
    }

    // 如果 RPC 失败，回退到带文档过滤的内存搜索
    return fallbackMemorySearch(embedding, threshold, limit, documentId);
  }

  // 尝试使用 RPC 函数进行向量搜索
  const { data, error } = await supabaseAdmin.rpc('search_chunks_v2', {
    query_vector_str: vectorString,
    match_threshold: threshold,
    match_count: limit,
  });

  // 如果 RPC 失败或返回空结果，回退到内存搜索
  if (error || !data || data.length === 0) {
    return fallbackMemorySearch(embedding, threshold, limit);
  }

  return data as SearchResult[];
}

/**
 * 内存搜索回退方案
 * 当 RPC 函数不可用时，在内存中计算余弦相似度
 */
async function fallbackMemorySearch(
  embedding: number[],
  threshold: number,
  limit: number,
  documentId?: string
): Promise<SearchResult[]> {
  let query = supabaseAdmin
    .from('document_chunks')
    .select('id, document_id, content, embedding');

  // 如果指定了文档 ID，添加过滤条件
  if (documentId) {
    query = query.eq('document_id', documentId);
  }

  const { data: allChunks, error: fetchError } = await query;

  if (fetchError) throw fetchError;

  if (!allChunks || allChunks.length === 0) {
    return [];
  }

  // 在内存中计算余弦相似度
  const results: SearchResult[] = allChunks.map(chunk => {
    const chunkEmbedding = typeof chunk.embedding === 'string'
      ? JSON.parse(chunk.embedding)
      : chunk.embedding;

    const dotProduct = embedding.reduce((sum: number, val: number, i: number) => sum + val * chunkEmbedding[i], 0);
    const normA = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0));
    const normB = Math.sqrt(chunkEmbedding.reduce((sum: number, val: number) => sum + val * val, 0));
    const similarity = dotProduct / (normA * normB);

    return {
      id: chunk.id,
      document_id: chunk.document_id,
      content: chunk.content,
      similarity,
    };
  });

  return results
    .filter(r => r.similarity > threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}