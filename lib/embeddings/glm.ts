const GLM_API_KEY = process.env.GLM_API_KEY!;
const GLM_API_BASE_URL = process.env.GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
const GLM_EMBEDDING_MODEL = process.env.GLM_EMBEDDING_MODEL || 'embedding-2';

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${GLM_API_BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: GLM_EMBEDDING_MODEL,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`);
  }

  const data = await response.json();

  // GLM API返回格式: { data: [{ embedding: [...] }] }
  return data.data[0].embedding;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  // 批量获取嵌入向量
  const embeddings: number[][] = [];

  for (const text of texts) {
    const embedding = await getEmbedding(text);
    embeddings.push(embedding);

    // 添加延迟避免API限流
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return embeddings;
}