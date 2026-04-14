const GLM_API_KEY = process.env.GLM_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN!;
const GLM_API_BASE_URL = process.env.GLM_API_BASE_URL || process.env.ANTHROPIC_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
const GLM_CHAT_MODEL = process.env.GLM_CHAT_MODEL || process.env.ANTHROPIC_DEFAULT_SONNET_MODEL || 'glm-5';

export async function chatCompletion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  // GLM 官方 API 使用 /chat/completions 端点
  const endpoint = `${GLM_API_BASE_URL}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: GLM_CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function* streamChatCompletion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string> {
  // GLM 官方 API 使用 /chat/completions 端点
  const endpoint = `${GLM_API_BASE_URL}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: GLM_CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const json = JSON.parse(line.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}