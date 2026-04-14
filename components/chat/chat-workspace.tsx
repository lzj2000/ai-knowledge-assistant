'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConversationSidebar } from './conversation-sidebar';
import { ChatComposer } from './chat-composer';
import { MessageList } from './message-list';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types/message';

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

  // 占位处理函数 - Task 7 会实现完整的流式响应逻辑
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

      const data = await response.json();

      // 更新会话 ID
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
        router.push(`/chat/${data.conversationId}`);
      }

      // 更新标题
      if (data.title && !title) {
        setTitle(data.title);
      }

      // 添加助手消息
      const assistantMsg: Message = {
        id: `temp-assistant-${Date.now()}`,
        conversation_id: data.conversationId || conversationId,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev.slice(0, -1), assistantMsg]);

    } catch {
      // 移除临时用户消息
      setMessages(prev => prev.slice(0, -1));
      // 这里可以添加 toast 提示
    } finally {
      setLoading(false);
    }
  }, [conversationId, documentId, title, router]);

  // 移动端抽屉模式
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-[color:var(--page)]">
        {/* 头部 */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--border-soft)] bg-[color:var(--surface)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[color:var(--surface-strong)]"
          >
            <span className="text-sm text-[color:var(--muted)]">会话列表</span>
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
            <div className="fixed left-0 top-0 h-full w-72 bg-[color:var(--surface)] shadow-lg">
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
          <MessageList messages={messages} loading={loading} />
          <div className="p-4">
            <ChatComposer onSend={handleSend} disabled={loading} />
          </div>
        </div>
      </div>
    );
  }

  // 桌面端双栏布局
  return (
    <div className="flex h-screen bg-[color:var(--page)]">
      {/* 左栏：会话列表 */}
      <ConversationSidebar activeId={conversationId} />

      {/* 右栏：对话主区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 头部：标题与提示 */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border-soft)] bg-[color:var(--surface)]">
          <div>
            {title ? (
              <h1 className="text-xl font-medium text-[color:var(--ink)]">{title}</h1>
            ) : (
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">新对话</p>
            )}
            {documentId && (
              <p className="text-xs text-[color:var(--muted)] mt-1">当前对话范围：指定文档</p>
            )}
          </div>
          {conversationId && (
            <Link href="/chat">
              <Button variant="secondary" size="sm">新建对话</Button>
            </Link>
          )}
        </header>

        {/* 消息列表 */}
        <MessageList messages={messages} loading={loading} />

        {/* 底部输入区 */}
        <div className="p-6">
          <ChatComposer onSend={handleSend} disabled={loading} />
        </div>
      </div>
    </div>
  );
}