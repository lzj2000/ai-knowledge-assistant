import { createUIMessageStream, createUIMessageStreamResponse, streamText } from 'ai';
import { getMessageText } from '@/lib/chat/message-parts';
import { glmModel } from '@/lib/chat/glm-provider';
import { prepareKnowledgeAnswer } from '@/lib/chat/knowledge-prompt';
import { createConversation, createMessage, getMessages } from '@/lib/supabase/conversations';
import type { ChatRequestBody } from '@/types/chat';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const question = getMessageText(body.message);

    if (!question.trim()) {
      return Response.json({ error: '请提供问题内容' }, { status: 400 });
    }

    // 获取或创建会话
    let conversationId = body.conversationId;
    if (!conversationId) {
      const conversation = await createConversation({ title: question.slice(0, 50) });
      conversationId = conversation.id;
    }

    // 持久化用户消息
    await createMessage({
      conversation_id: conversationId,
      role: 'user',
      content: question
    });

    // 获取历史消息并准备知识问答
    const history = await getMessages(conversationId);
    const prepared = await prepareKnowledgeAnswer({
      question,
      history,
      documentId: body.documentId
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
          conversation_id: conversationId!,
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
          writer.write({ type: 'data-conversation', data: { conversationId } });
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