import { retrieveRelevantChunks, chunksToSources, RetrieveOptions } from '@/lib/rag/retrieval';
import { getEmbedding } from '@/lib/embeddings/glm';
import { searchSimilarChunks } from '@/lib/supabase/chunks';
import { getDocument } from '@/lib/supabase/documents';
import { vi, describe, expect, it, beforeEach } from 'vitest';

// Mock supabase client first to prevent initialization errors
vi.mock('@/lib/supabase/client', () => ({
  supabase: {},
  supabaseAdmin: {}
}));

vi.mock('@/lib/embeddings/glm');
vi.mock('@/lib/supabase/chunks');
vi.mock('@/lib/supabase/documents');

describe('retrieveRelevantChunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return chunks sorted by similarity', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockChunks = [
      { id: 'chunk-1', document_id: 'doc-1', content: '内容1', similarity: 0.9 },
      { id: 'chunk-2', document_id: 'doc-2', content: '内容2', similarity: 0.7 },
    ];

    vi.mocked(getEmbedding).mockResolvedValue(mockEmbedding);
    vi.mocked(searchSimilarChunks).mockResolvedValue(mockChunks);
    vi.mocked(getDocument).mockImplementation(async (id: string) => ({
      id,
      title: id === 'doc-1' ? '文档1' : '文档2',
      file_name: 'test.pdf',
      file_path: '/test.pdf',
      file_size: 1024,
      file_type: 'pdf',
      category_id: null,
      version: 1,
      status: 'ready',
      chunk_count: 2,
      created_at: '2026-04-14T10:00:00.000Z',
      updated_at: '2026-04-14T10:00:00.000Z'
    }));

    const result = await retrieveRelevantChunks('测试问题');

    expect(getEmbedding).toHaveBeenCalledWith('测试问题');
    expect(searchSimilarChunks).toHaveBeenCalledWith(mockEmbedding, {
      limit: 10,
      threshold: 0.1,
      documentId: undefined,
    });
    expect(result).toHaveLength(2);
    expect(result[0].document_title).toBe('文档1');
    expect(result[1].document_title).toBe('文档2');
  });

  it('should pass documentId to searchSimilarChunks when provided', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockChunks = [
      { id: 'chunk-1', document_id: 'doc-target', content: '内容1', similarity: 0.9 },
    ];

    vi.mocked(getEmbedding).mockResolvedValue(mockEmbedding);
    vi.mocked(searchSimilarChunks).mockResolvedValue(mockChunks);
    vi.mocked(getDocument).mockResolvedValue({
      id: 'doc-target',
      title: '目标文档',
      file_name: 'target.pdf',
      file_path: '/target.pdf',
      file_size: 1024,
      file_type: 'pdf',
      category_id: null,
      version: 1,
      status: 'ready',
      chunk_count: 2,
      created_at: '2026-04-14T10:00:00.000Z',
      updated_at: '2026-04-14T10:00:00.000Z'
    });

    const options: RetrieveOptions = {
      documentId: 'doc-target',
      limit: 5,
    };

    const result = await retrieveRelevantChunks('测试问题', options);

    expect(searchSimilarChunks).toHaveBeenCalledWith(mockEmbedding, {
      limit: 5,
      threshold: 0.1,
      documentId: 'doc-target',
    });
    expect(result).toHaveLength(1);
    expect(result[0].document_id).toBe('doc-target');
  });
});

describe('chunksToSources', () => {
  it('should convert chunks to MessageSource format', () => {
    const chunks = [
      {
        chunk_id: 'chunk-1',
        document_id: 'doc-1',
        content: '这是一段很长的内容，需要被截断显示...',
        similarity: 0.9,
        document_title: '测试文档',
      },
    ];

    const sources = chunksToSources(chunks);

    expect(sources).toHaveLength(1);
    expect(sources[0].document_id).toBe('doc-1');
    expect(sources[0].document_title).toBe('测试文档');
    expect(sources[0].chunk_id).toBe('chunk-1');
    // 内容应该被截断到 200 字符并添加 '...'
    expect(sources[0].content.endsWith('...')).toBe(true);
  });
});