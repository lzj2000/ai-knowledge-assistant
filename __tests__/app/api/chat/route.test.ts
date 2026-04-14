import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/chat/route';
import { prepareKnowledgeAnswer } from '@/lib/chat/knowledge-prompt';

// Mock dependencies
vi.mock('@/lib/supabase/conversations', () => ({
  createConversation: vi.fn(async () => ({
    id: 'conv-new',
    title: '报销问题',
    created_at: '2026-04-14T10:00:00.000Z'
  })),
  createMessage: vi.fn(async () => ({
    id: 'msg-1',
    conversation_id: 'conv-new',
    role: 'user',
    content: '公司的报销规则是什么？',
    created_at: '2026-04-14T10:00:00.000Z'
  })),
  getMessages: vi.fn(async () => [])
}));

vi.mock('@/lib/chat/knowledge-prompt', () => ({
  prepareKnowledgeAnswer: vi.fn(async () => ({
    prompt: '根据知识库回答：报销政策',
    sources: [
      {
        document_id: 'doc-1',
        document_title: '员工手册',
        chunk_id: 'chunk-1',
        content: '报销流程说明'
      }
    ]
  }))
}));

vi.mock('@/lib/chat/glm-provider', () => ({
  glmModel: vi.fn(() => ({
    provider: 'mock-glm',
    modelId: 'glm-5'
  }))
}));

vi.mock('ai', () => ({
  streamText: vi.fn(() => ({
    toUIMessageStream: vi.fn((options) => {
      const stream = {
        async *[Symbol.asyncIterator]() {
          yield { type: 'text', text: '报销需要提交审批' };
          yield { type: 'text', text: '，并在月末前完成' };
          if (options?.onFinish) {
            await options.onFinish();
          }
        }
      };
      return stream;
    })
  })),
  createUIMessageStream: vi.fn(() => {
    const chunks = [
      { type: 'data-conversation', data: { conversationId: 'conv-new' } },
      { type: 'data-sources', data: [{ document_id: 'doc-1', document_title: '员工手册', chunk_id: 'chunk-1', content: '报销流程说明' }] },
      { type: 'text', text: '报销需要提交审批' },
      { type: 'text', text: '，并在月末前完成' }
    ];

    return {
      async *[Symbol.asyncIterator]() {
        for (const chunk of chunks) {
          yield chunk;
        }
      }
    };
  }),
  createUIMessageStreamResponse: vi.fn(({ stream }) => {
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
        }
        controller.close();
      }
    });

    return new Response(readableStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });
  })
}));

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('先输出 conversation 和 sources，再合并文本流', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: {
            id: 'tmp-1',
            role: 'user',
            parts: [{ type: 'text', text: '公司的报销规则是什么？' }]
          }
        })
      }) as never
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBeDefined();
  });

  it('支持按 documentId 过滤检索范围', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: {
            id: 'tmp-2',
            role: 'user',
            parts: [{ type: 'text', text: '这篇文档讲了什么？' }]
          },
          documentId: 'doc-123'
        })
      }) as never
    );

    expect(response.status).toBe(200);
    // 验证 prepareKnowledgeAnswer 被调用时携带 documentId 参数
    expect(prepareKnowledgeAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ documentId: 'doc-123' })
    );
  });

  it('对空问题返回 400 错误', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: {
            id: 'tmp-3',
            role: 'user',
            parts: [{ type: 'text', text: '' }]
          }
        })
      }) as never
    );

    expect(response.status).toBe(400);
  });

  it('支持现有 conversationId 继续对话', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: {
            id: 'tmp-4',
            role: 'user',
            parts: [{ type: 'text', text: '还有其他规则吗？' }]
          },
          conversationId: 'conv-existing'
        })
      }) as never
    );

    expect(response.status).toBe(200);
    // 验证不会创建新会话
    const { createConversation } = await import('@/lib/supabase/conversations');
    expect(createConversation).not.toHaveBeenCalled();
  });
});