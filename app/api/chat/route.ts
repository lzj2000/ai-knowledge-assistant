import { createUIMessageStream, createUIMessageStreamResponse, streamText } from 'ai';
import { getMessageText } from '@/lib/chat/message-parts';
import { glmModel } from '@/lib/chat/glm-provider';
import { prepareKnowledgeAnswer } from '@/lib/chat/knowledge-prompt';
import { createConversation, createMessage, getMessages } from '@/lib/supabase/conversations';

// 兼容两种请求格式：
// 新格式（AI SDK）: { message: { parts: [{ type: 'text', text: '...' }] } }
// 旧格式: { question: '...' }
interface LegacyRequestBody {
  question?: string;
  conversationId?: string;
  documentId?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 兼容新旧两种请求格式
    const question = body.message
      ? getMessageText(body.message)
      : (body as LegacyRequestBody).question || '';

    if (!question.trim()) {
      return Response.json({ error: '请提供问题内容' }, { status: 400 });
    }

    // 从新旧格式中提取 conversationId 和 documentId
    const conversationId = body.conversationId;
    const documentId = body.documentId;

    // 获取或创建会话
    let convId = conversationId;
    if (!convId) {
      const conversation = await createConversation({ title: question.slice(0, 50) });
      convId = conversation.id;
    }

    // 持久化用户消息
    await createMessage({
      conversation_id: convId,
      role: 'user',
      content: question
    });

    // 获取历史消息并准备知识问答
    const history = await getMessages(convId);
    const prepared = await prepareKnowledgeAnswer({
      question,
      history,
      documentId
    });

    let fullAnswer = '';

    // 启动流式生成，使用 onFinish 回调保存完整回答
    const result = streamText({
      model: glmModel(),
      prompt: prepared.prompt,
      onFinish: async ({ text }) => {
        fullAnswer = text;
        // 保存完整回答和来源
        await createMessage({
          conversation_id: convId!,
          role: 'assistant',
          content: fullAnswer,
          sources: prepared.sources
        });
      }
    });

    // 返回 AI SDK 流式响应
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: ({ writer }) => {
          // 先输出 conversationId
          writer.write({ type: 'data-conversation', data: { conversationId: convId } });
          // 再输出 sources
          writer.write({ type: 'data-sources', data: prepared.sources });

          // 合并文本流
          writer.merge(result.toUIMessageStream());
        }
      })
    });
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : '问答失败';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}