// Embedding 使用 GLM 官方 API
// 动态获取环境变量，避免缓存问题
function getApiKey(): string {
  return process.env.GLM_API_KEY || process.env.GLM_EMBEDDING_API_KEY || '';
}
function getApiBaseUrl(): string {
  return process.env.GLM_API_BASE_URL || process.env.GLM_EMBEDDING_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
}
function getEmbeddingModel(): string {
  return process.env.GLM_EMBEDDING_MODEL || 'embedding-2';
}

export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = getApiKey();
  const baseUrl = getApiBaseUrl();
  const model = getEmbeddingModel();

  const response = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: model,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API error: ${response.statusText} - ${errorText}`);
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