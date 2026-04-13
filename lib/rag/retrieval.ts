import { getEmbedding } from '@/lib/embeddings/glm';
import { searchSimilarChunks } from '@/lib/supabase/chunks';
import { getDocument } from '@/lib/supabase/documents';
import { MessageSource } from '@/types/message';

export interface RetrievedChunk {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  document_title?: string;
}

interface SearchResult {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
}

export async function retrieveRelevantChunks(
  question: string,
  options?: { limit?: number; threshold?: number }
): Promise<RetrievedChunk[]> {
  // 1. 获取问题的向量嵌入
  const embedding = await getEmbedding(question);

  // 2. 搜索相似分块
  const chunks = await searchSimilarChunks(embedding, {
    limit: options?.limit || 5,
    threshold: options?.threshold || 0.7,
  }) as unknown as SearchResult[];

  // 3. 获取文档标题
  const chunksWithTitles = await Promise.all(
    chunks.map(async (chunk) => {
      const document = await getDocument(chunk.document_id);
      return {
        chunk_id: chunk.id,
        document_id: chunk.document_id,
        content: chunk.content,
        similarity: chunk.similarity,
        document_title: document?.title || '未知文档',
      };
    })
  );

  return chunksWithTitles;
}

export function chunksToSources(chunks: RetrievedChunk[]): MessageSource[] {
  return chunks.map(chunk => ({
    document_id: chunk.document_id,
    document_title: chunk.document_title || '未知文档',
    chunk_id: chunk.chunk_id,
    content: chunk.content.slice(0, 200) + '...',
  }));
}