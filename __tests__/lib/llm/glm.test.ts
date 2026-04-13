import { chatCompletion } from '@/lib/llm/glm';
import { buildRAGPrompt } from '@/lib/llm/prompts';

global.fetch = jest.fn();

describe('chatCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call GLM API with correct parameters', async () => {
    const mockResponse = {
      choices: [{ message: { content: '这是回答' } }],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await chatCompletion('测试问题');

    expect(result).toBe('这是回答');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});

describe('buildRAGPrompt', () => {
  it('should build prompt with context and question', () => {
    const prompt = buildRAGPrompt('参考资料内容', '用户问题');

    expect(prompt).toContain('参考资料内容');
    expect(prompt).toContain('用户问题');
  });
});