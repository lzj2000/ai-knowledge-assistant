'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Conversation } from '@/types/conversation';

// 全局缓存，避免不同组件实例重复请求
let cachedConversations: Conversation[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5秒缓存

export function useConversationList(limit = 20) {
  const [conversations, setConversations] = useState<Conversation[]>(cachedConversations || []);
  const [loading, setLoading] = useState(!cachedConversations);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  const fetchList = useCallback(async (forceRefresh = false) => {
    // 如果有缓存且未过期，不重新请求（除非强制刷新）
    const now = Date.now();
    if (!forceRefresh && cachedConversations && now - cacheTimestamp < CACHE_DURATION) {
      setConversations(cachedConversations);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations?limit=${limit}`);
      if (!res.ok) throw new Error('获取会话列表失败');
      const data: Conversation[] = await res.json();
      cachedConversations = data;
      cacheTimestamp = now;
      setConversations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // 只在首次挂载时请求
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchList();
    }
  }, [fetchList]);

  const deleteConversation = useCallback(async (id: string) => {
    setConversations((list) => list.filter((c) => c.id !== id));
    cachedConversations = conversations.filter((c) => c.id !== id);
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        // 回滚：重新获取列表
        fetchList(true);
        throw new Error('删除失败');
      }
    } catch (e) {
      fetchList(true);
      throw e;
    }
  }, [conversations, fetchList]);

  // 新增会话后刷新列表
  const addConversation = useCallback((conversation: Conversation) => {
    const newList = [conversation, ...conversations];
    setConversations(newList);
    cachedConversations = newList;
    cacheTimestamp = Date.now();
  }, [conversations]);

  return { conversations, loading, error, refresh: () => fetchList(true), deleteConversation, addConversation };
}