import { CreateChunkInput } from '@/types/chunk';

interface ChunkOptions {
  chunkSize: number;
  overlap: number;
}

export function chunkText(
  text: string,
  options: ChunkOptions = { chunkSize: 500, overlap: 50 }
): Omit<CreateChunkInput, 'document_id'>[] {
  const { chunkSize, overlap } = options;
  const chunks: Omit<CreateChunkInput, 'document_id'>[] = [];

  if (text.length <= chunkSize) {
    chunks.push({
      content: text,
      chunk_index: 0,
    });
    return chunks;
  }

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const content = text.slice(startIndex, endIndex);

    chunks.push({
      content,
      chunk_index: chunkIndex,
    });

    // 下一个块的起始位置考虑重叠
    startIndex = endIndex - overlap;
    chunkIndex++;

    // 避免最后一个块过小
    if (startIndex >= text.length - overlap) {
      break;
    }
  }

  return chunks;
}