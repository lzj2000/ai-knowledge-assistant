import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const provider = createOpenAICompatible({
  name: 'glm',
  baseURL: process.env.GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.GLM_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || ''
});

export function glmModel(modelName = process.env.GLM_CHAT_MODEL || 'glm-5') {
  return provider.chatModel(modelName);
}