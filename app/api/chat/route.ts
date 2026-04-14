import { NextRequest } from 'next/server';
import { askQuestion } from '@/lib/rag';
import { getMessages, createMessage, createConversation } from '@/lib/supabase/conversations';
import { MessageSource } from '@/types/message';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, conversationId } = body;

    if (!question) {
      return new Response(JSON.stringify({ error: '请提供问题' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取或创建对话
    let convId = conversationId;
    if (!convId) {
      const conversation = await createConversation({ title: question.slice(0, 50) });
      convId = conversation.id;
    }

    // 获取历史消息
    const history = await getMessages(convId);

    // 保存用户问题
    await createMessage({
      conversation_id: convId,
      role: 'user',
      content: question,
    });

    // 执行RAG问答
    const result = await askQuestion(question, {
      conversationHistory: history,
      stream: false,
    });

    // 处理流式和非流式响应
    if (result instanceof Object && 'answer' in result) {
      const { answer, sources } = result as { answer: string; sources: MessageSource[] };

      // 保存助手回答
      await createMessage({
        conversation_id: convId,
        role: 'assistant',
        content: answer,
        sources,
      });

      return new Response(JSON.stringify({
        answer,
        sources,
        conversationId: convId,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // 流式响应
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          let fullAnswer = '';

          for await (const chunk of result as AsyncGenerator<string>) {
            fullAnswer += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }

          await createMessage({
            conversation_id: convId,
            role: 'assistant',
            content: fullAnswer,
          });

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : '问答失败';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}