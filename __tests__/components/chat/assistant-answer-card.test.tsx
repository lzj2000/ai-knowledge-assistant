import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssistantAnswerCard } from '@/components/chat/assistant-answer-card';
import type { KnowledgeUIMessage } from '@/types/chat';

describe('AssistantAnswerCard', () => {
  it('渲染 markdown 与来源引用', () => {
    const message: KnowledgeUIMessage = {
      id: 'm-1',
      role: 'assistant',
      metadata: { conversationId: 'conv-1' },
      parts: [
        { type: 'text', text: '## 报销规则\n- 需要审批' },
        {
          type: 'data-sources',
          data: [
            {
              document_id: 'doc-1',
              document_title: '员工手册',
              chunk_id: 'chunk-1',
              content: '审批流程说明'
            }
          ]
        }
      ]
    };

    render(<AssistantAnswerCard message={message} isStreaming={false} />);

    expect(screen.getByText('报销规则')).toBeInTheDocument();
    expect(screen.getByText('员工手册')).toBeInTheDocument();
    expect(screen.getByText('审批流程说明')).toBeInTheDocument();
  });

  it('在流式生成时显示生成中状态', () => {
    const message: KnowledgeUIMessage = {
      id: 'm-2',
      role: 'assistant',
      metadata: {},
      parts: [{ type: 'text', text: '正在生成...' }]
    };

    render(<AssistantAnswerCard message={message} isStreaming={true} />);

    expect(screen.getByText('生成中')).toBeInTheDocument();
  });

  it('没有来源时不显示参考来源区', () => {
    const message: KnowledgeUIMessage = {
      id: 'm-3',
      role: 'assistant',
      metadata: {},
      parts: [{ type: 'text', text: '普通回答' }]
    };

    render(<AssistantAnswerCard message={message} isStreaming={false} />);

    expect(screen.queryByText('参考来源')).not.toBeInTheDocument();
  });
});