'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '@/types/conversation';

export function useConversationList(limit = 20) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations?limit=${limit}`);
      if (!res.ok) throw new Error('获取会话列表失败');
      const data: Conversation[] = await res.json();
      setConversations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const deleteConversation = useCallback(async (id: string) => {
    const prev = conversations;
    setConversations((list) => list.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setConversations(prev);
        throw new Error('删除失败');
      }
    } catch (e) {
      setConversations(prev);
      throw e;
    }
  }, [conversations]);

  return { conversations, loading, error, refresh: fetchList, deleteConversation };
}