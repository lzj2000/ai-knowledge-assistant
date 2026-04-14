'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Conversation } from '@/types/conversation';

interface ConversationContextValue {
  conversations: Conversation[];
  loading: boolean;
  refresh: () => Promise<void>;
  addConversation: (conv: Conversation) => void;
  deleteConversation: (id: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations?limit=20');
      if (!res.ok) throw new Error('获取失败');
      const data: Conversation[] = await res.json();
      setConversations(data);
    } catch (e) {
      console.error('Fetch conversations error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchList();
    }
  }, [fetchList]);

  const addConversation = useCallback((conv: Conversation) => {
    setConversations(prev => [conv, ...prev]);
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    // 乐观更新：先保存当前状态用于回滚
    const previous = conversations;
    setConversations(prev => prev.filter(c => c.id !== id));

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setConversations(previous); // 回滚
        throw new Error('删除失败');
      }
    } catch (e) {
      setConversations(previous); // 回滚
      throw e;
    }
  }, [conversations]);

  return (
    <ConversationContext.Provider value={{
      conversations,
      loading,
      refresh: fetchList,
      addConversation,
      deleteConversation,
    }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error('useConversations must be used within ConversationProvider');
  return ctx;
}