'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogBody } from '@/components/ui/dialog';
import { useConversationList } from '@/hooks/use-conversation-list';
import { useToast } from '@/components/ui/toast';

interface ConversationSidebarProps {
  activeId?: string;
}

export function ConversationSidebar({ activeId }: ConversationSidebarProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { conversations, loading, deleteConversation } = useConversationList(20);
  // deletingId 用于追踪当前正在删除的会话（可选的 UI 状态）
  const [, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation(id);
      if (activeId === id) {
        router.push('/chat');
      }
      showToast('success', '会话已删除');
    } catch {
      showToast('error', '删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="w-72 border-r border-[color:var(--border-soft)] bg-[color:var(--surface)] p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[color:var(--muted)]">最近会话</h2>
        <Link href="/chat">
          <Button size="sm">新建</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-[color:var(--border-soft)] animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-8 text-sm text-[color:var(--muted)]">
          暂无会话记录
        </div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conv) => (
            <li key={conv.id} className="group relative">
              <Link
                href={`/chat/${conv.id}`}
                className={`block p-3 rounded-lg transition-colors ${
                  activeId === conv.id
                    ? 'bg-[color:var(--surface-strong)] border border-[color:var(--border-strong)]'
                    : 'hover:bg-[color:var(--surface-strong)]'
                }`}
              >
                <p className="text-sm truncate text-[color:var(--ink)]">{conv.title ?? '未命名会话'}</p>
                <p className="text-xs text-[color:var(--muted)]">{formatDate(conv.created_at)}</p>
              </Link>

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[color:var(--muted)] hover:text-[color:var(--accent)] transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeletingId(conv.id);
                    }}
                  >
                    <span className="text-lg">x</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>确认删除会话</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <p className="text-sm text-[color:var(--muted)]">删除后将同时移除该会话的全部消息记录，无法恢复。</p>
                  </DialogBody>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setDeletingId(null)}>取消</Button>
                    <Button variant="danger" onClick={() => handleDelete(conv.id)}>确认删除</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}