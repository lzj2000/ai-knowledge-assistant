import { parseDocument } from '@/lib/document-processing/parser';

describe('parseDocument', () => {
  it('should parse plain text correctly', async () => {
    const buffer = Buffer.from('Hello World\n这是测试文本');
    const result = await parseDocument(buffer, 'txt');

    expect(result).toBe('Hello World\n这是测试文本');
  });

  it('should parse markdown as text', async () => {
    const buffer = Buffer.from('# Title\n\nContent here');
    const result = await parseDocument(buffer, 'md');

    expect(result).toContain('# Title');
    expect(result).toContain('Content here');
  });

  it('should throw error for unsupported file type', async () => {
    const buffer = Buffer.from('test');

    await expect(parseDocument(buffer, 'xlsx')).rejects.toThrow('Unsupported file type');
  });
});