import { getEmbedding } from '@/lib/embeddings/glm';

// Mock fetch for testing
global.fetch = jest.fn();

describe('getEmbedding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call GLM API with correct parameters', async () => {
    const mockResponse = {
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
    });

    await expect(getEmbedding('测试')).rejects.toThrow('Embedding API error');
  });
});