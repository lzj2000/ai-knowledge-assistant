export const RAG_PROMPT_TEMPLATE = `你是一个智能问答助手。请根据提供的参考资料回答用户问题。

参考资料：
{context}

用户问题：{question}

请根据参考资料回答问题。如果参考资料中没有相关信息，请说明"根据现有文档无法回答此问题"。
回答时请标注引用来源，格式为 [文档名]。

回答：`;

export function buildRAGPrompt(context: string, question: string): string {
  return RAG_PROMPT_TEMPLATE
    .replace('{context}', context)
    .replace('{question}', question);
}

export const CONVERSATION_PROMPT_TEMPLATE = `你是一个智能问答助手。以下是之前的对话历史：

{history}

当前问题：{question}

请结合对话历史回答当前问题。保持回答简洁准确。`;

export function buildConversationPrompt(
  history: string,
  question: string
): string {
  return CONVERSATION_PROMPT_TEMPLATE
    .replace('{history}', history)
    .replace('{question}', question);
}