import { supabaseAdmin } from '@/lib/supabase/client';
import { parseDocument, getFileTypeFromExtension } from './parser';
import { chunkText } from './chunker';
import { getEmbeddings } from '@/lib/embeddings/glm';
import { createChunks, deleteChunksByDocument } from '@/lib/supabase/chunks';
import { updateDocument } from '@/lib/supabase/documents';
import { CreateChunkInput } from '@/types/chunk';

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export async function processDocument(
  documentId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<void> {
  try {
    // 1. 解析文档
    const fileType = getFileTypeFromExtension(fileName);
    const text = await parseDocument(fileBuffer, fileType);

    // 2. 文本分块
    const chunks = chunkText(text, {
      chunkSize: CHUNK_SIZE,
      overlap: CHUNK_OVERLAP,
    });

    // 3. 获取向量嵌入
    const contents = chunks.map(c => c.content);
    const embeddings = await getEmbeddings(contents);

    // 4. 删除旧分块（如果存在）
    await deleteChunksByDocument(documentId);

    // 5. 存储新分块
    const chunkInputs: CreateChunkInput[] = chunks.map((chunk, index) => ({
      document_id: documentId,
      content: chunk.content,
      chunk_index: chunk.chunk_index,
      embedding: embeddings[index],
    }));

    await createChunks(chunkInputs);

    // 6. 更新文档状态
    await updateDocument(documentId, {
      status: 'ready',
      chunk_count: chunks.length,
    });

  } catch (error) {
    // 更新文档状态为错误
    await updateDocument(documentId, {
      status: 'error',
    });
    throw error;
  }
}

export async function uploadFileToStorage(
  file: File,
  bucket: string = 'documents'
): Promise<{ path: string; error: Error | null }> {
  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    return { path: '', error };
  }

  return { path: data.path, error: null };
}

export async function downloadFileFromStorage(
  path: string,
  bucket: string = 'documents'
): Promise<{ buffer: Buffer; error: Error | null }> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(path);

  if (error) {
    return { buffer: Buffer.alloc(0), error };
  }

  return { buffer: Buffer.from(await data.arrayBuffer()), error: null };
}