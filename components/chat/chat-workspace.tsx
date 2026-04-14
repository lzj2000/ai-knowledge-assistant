'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationSidebar } from './conversation-sidebar';
import { ChatComposer } from './chat-composer';
import { MessageList } from './message-list';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useConversations } from '@/contexts/conversation-context';
import type { Message } from '@/types/message';
import type { MessageSource } from '@/types/message';

interface ChatWorkspaceProps {
  initialConversationId?: string;
  initialMessages: Message[];
  initialTitle: string | null;
  documentId?: string;
}

export function ChatWorkspace({
  initialConversationId,
  initialMessages,
  initialTitle,
  documentId,
}: ChatWorkspaceProps) {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(false);

  // 会话列表 hook，用于新建会话后更新
  const { addConversation } = useConversations();

  // 处理流式响应
  const handleSend = useCallback(async (question: string) => {
    setLoading(true);

    // 添加用户消息
    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId || '',
      role: 'user',
      content: question,
      sources: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // 添加占位的助手消息（用于流式更新）
    const tempAssistantId = `temp-assistant-${Date.now()}`;
    const tempAssistantMsg: Message = {
      id: tempAssistantId,
      conversation_id: conversationId || '',
      role: 'assistant',
      content: '',
      sources: [],
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempAssistantMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          conversationId,
          documentId,
        }),
      });

      if (!response.ok) throw new Error('请求失败');

      // 处理 SSE 流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let receivedConversationId = '';
      let receivedSources: MessageSource[] = [];
      let sseBuffer = '';

      const processBufferedEvents = (flush = false) => {
        const lines = sseBuffer.split('\n');

        if (flush) {
          sseBuffer = '';
        } else {
          sseBuffer = lines.pop() ?? '';
        }

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith('data: ')) {
            continue;
          }

          const payload = line.slice(6);
          if (!payload || payload === '[DONE]') {
            continue;
          }

          try {
            const data = JSON.parse(payload);

            if (data.type === 'data-conversation') {
              receivedConversationId = data.data.conversationId;
            } else if (data.type === 'data-sources') {
              receivedSources = data.data;
            } else if (data.type === 'text-delta' || (data.type === 'text' && data.text)) {
              const textDelta = data.text || data.delta || '';
              accumulatedText += textDelta;

              setMessages(prev => prev.map(msg =>
                msg.id === tempAssistantId
                  ? { ...msg, content: accumulatedText }
                  : msg
              ));
            }
          } catch {
            // 忽略单条事件解析失败，继续读取后续数据
          }
        }
      };

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          processBufferedEvents();
        }

        sseBuffer += decoder.decode();
        processBufferedEvents(true);
      }

      // 流结束，更新最终消息
      const finalAssistantMsg: Message = {
        id: tempAssistantId,
        conversation_id: receivedConversationId || conversationId || '',
        role: 'assistant',
        content: accumulatedText,
        sources: receivedSources,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => prev.map(msg =>
        msg.id === tempAssistantId ? finalAssistantMsg : msg
      ));

      // 更新会话 ID 和标题
      if (receivedConversationId && !conversationId) {
        setConversationId(receivedConversationId);
        // 添加到会话列表
        addConversation({
          id: receivedConversationId,
          title: question.slice(0, 50),
          created_at: new Date().toISOString()
        });
        router.push(`/chat/${receivedConversationId}`);
      }

      if (!title) {
        setTitle(question.slice(0, 50));
      }

    } catch (error) {
      // 移除占位消息
      setMessages(prev => prev.filter(msg =>
        msg.id !== tempUserMsg.id && msg.id !== tempAssistantId
      ));
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, documentId, title, router, addConversation]);

  // 移动端抽屉模式
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-[color:var(--page)]">
        {/* 会话标题行 */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--border-soft)] bg-[color:var(--surface)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[color:var(--surface-strong)]"
          >
            <span className="text-sm text-[color:var(--muted)]">会话</span>
          </button>
          {title && (
            <h1 className="text-sm font-medium text-[color:var(--ink)] truncate">{title}</h1>
          )}
        </header>

        {/* 抽屉侧栏 */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-72 bg-[color:var(--surface)] shadow-lg overflow-hidden">
              <ConversationSidebar activeId={conversationId} />
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[color:var(--surface-strong)]"
              >
                x
              </button>
            </div>
          </div>
        )}

        {/* 对话主区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MessageList messages={messages} loading={loading} isStreaming={loading && messages.some(m => m.role === 'assistant' && m.content === '')} />
          <div className="p-4">
            <ChatComposer onSend={handleSend} disabled={loading} />
          </div>
        </div>
      </div>
    );
  }

  // 桌面端双栏布局
  return (
    <div className="h-full flex bg-[color:var(--page)]">
      {/* 左栏：会话列表 */}
      <ConversationSidebar activeId={conversationId} />

      {/* 右栏：对话主区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 头部：标题与提示 */}
        <header className="px-6 py-4 border-b border-[color:var(--border-soft)] bg-[color:var(--surface)]">
          {title ? (
            <h1 className="text-xl font-medium text-[color:var(--ink)]">{title}</h1>
          ) : (
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">新对话</p>
          )}
          {documentId && (
            <p className="text-xs text-[color:var(--muted)] mt-1">当前对话范围：指定文档</p>
          )}
        </header>

        {/* 消息列表 */}
        <MessageList messages={messages} loading={loading} isStreaming={loading && messages.some(m => m.role === 'assistant' && !m.content)} />

        {/* 底部输入区 */}
        <div className="p-6">
          <ChatComposer onSend={handleSend} disabled={loading} />
        </div>
      </div>
    </div>
  );
}
