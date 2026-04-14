import { describe, expect, it } from 'vitest';
import type { Message } from '@/types/message';
import { getAssistantSources, getMessageText, mapStoredMessageToUIMessage } from '@/lib/chat/message-parts';

const storedAssistant: Message = {
  id: 'm-2',
  conversation_id: 'c-1',
  role: 'assistant',
  content: '答案正文',
  created_at: '2026-04-14T10:00:00.000Z',
  sources: [
    {
      document_id: 'doc-1',
      document_title: '员工手册',
      chunk_id: 'chunk-1',
      content: '关于报销流程的段落'
    }
  ]
};

describe('message parts helpers', () => {
  it('能把数据库消息映射成 UI 消息，并提取文本与来源', () => {
    const uiMessage = mapStoredMessageToUIMessage(storedAssistant);

    expect(uiMessage.parts.some((part) => part.type === 'text')).toBe(true);
    expect(getAssistantSources(uiMessage)).toEqual(storedAssistant.sources);
    expect(getMessageText(uiMessage)).toBe('答案正文');
  });
});