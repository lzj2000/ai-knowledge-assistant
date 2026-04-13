import { retrieveRelevantChunks } from '@/lib/rag/retrieval';
import { getEmbedding } from '@/lib/embeddings/glm';

jest.mock('@/lib/embeddings/glm');
jest.mock('@/lib/supabase/chunks');

describe('retrieveRelevantChunks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return chunks sorted by similarity', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];

    (getEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);

    const result = await retrieveRelevantChunks('测试问题');

    expect(getEmbedding).toHaveBeenCalledWith('测试问题');
  });
});