import { getEmbedding } from '@/lib/embeddings/glm';
import { vi, describe, expect, it, beforeEach } from 'vitest';

// Mock fetch for testing
vi.stubGlobal('fetch', vi.fn());

describe('getEmbedding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call GLM API with correct parameters', async () => {
    const mockResponse = {
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await getEmbedding('测试文本');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/embeddings'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.any(String),
        }),
      })
    );

    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it('should throw error when API fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
      text: async () => 'Unauthorized',
    } as Response);

    await expect(getEmbedding('测试')).rejects.toThrow('Embedding API error');
  });
});