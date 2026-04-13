'use client';

import React, { useState, useEffect } from 'react';
import { Message } from '@/types/message';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { useToast } from '@/components/ui/toast';

interface ChatContainerProps {
  conversationId?: string;
  documentId?: string;
}

export function ChatContainer({ conversationId, documentId }: ChatContainerProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(conversationId);

  useEffect(() => {
    if (currentConvId) {
      loadMessages(currentConvId);
    }
  }, [currentConvId]);

  const loadMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      showToast('error', '加载对话历史失败');
    }
  };

  const handleSend = async (question: string) => {
    setLoading(true);

    const tempUserMsg: Message = {
      id: 'temp-user',
      conversation_id: currentConvId || '',
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
          conversationId: currentConvId,
          documentId,
        }),
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();

      if (data.conversationId && !currentConvId) {
        setCurrentConvId(data.conversationId);
      }

      const assistantMsg: Message = {
        id: 'temp-assistant',
        conversation_id: data.conversationId,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev.slice(0, -1), assistantMsg]);

    } catch (error) {
      showToast('error', '问答失败');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] border rounded-lg">
      <MessageList messages={messages} loading={loading} />
      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}