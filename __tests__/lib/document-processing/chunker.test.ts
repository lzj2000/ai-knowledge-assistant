import { chunkText } from '@/lib/document-processing/chunker';

describe('chunkText', () => {
  it('should split text into chunks of specified size', () => {
    const text = '这是一段测试文本，用于验证分块功能。分块器应该将文本按照指定的大小进行切分。';
    const chunks = chunkText(text, { chunkSize: 20, overlap: 5 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].content.length).toBeLessThanOrEqual(20);
  });

  it('should include overlap between chunks', () => {
    const text = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
    const chunks = chunkText(text, { chunkSize: 10, overlap: 3 });

    // 第二个块应该包含第一个块的末尾部分
    expect(chunks[1].content.slice(0, 3)).toBe(chunks[0].content.slice(-3));
  });

  it('should return single chunk for short text', () => {
    const text = '短文本';
    const chunks = chunkText(text, { chunkSize: 100, overlap: 10 });

    expect(chunks.length).toBe(1);
    expect(chunks[0].content).toBe('短文本');
  });

  it('should assign correct index to each chunk', () => {
    const text = '第一部分内容。第二部分内容。第三部分内容。第四部分内容。';
    const chunks = chunkText(text, { chunkSize: 10, overlap: 2 });

    chunks.forEach((chunk, index) => {
      expect(chunk.chunk_index).toBe(index);
    });
  });
});