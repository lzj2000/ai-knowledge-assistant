import Link from 'next/link';
import type { Conversation } from '@/types/conversation';

interface RecentConversationListProps {
  conversations: Conversation[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

export function RecentConversationList({ conversations }: RecentConversationListProps) {
  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">
          最近会话
        </p>
        <Link
          href="/chat"
          className="text-sm text-[color:var(--muted)] hover:text-[color:var(--accent-strong)]"
        >
          新建会话 →
        </Link>
      </div>

      <ul className="mt-4 space-y-2">
        {conversations.slice(0, 5).map((conv) => (
          <li key={conv.id}>
            <Link
              href={`/chat/${conv.id}`}
              className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-[color:var(--surface-strong)]"
            >
              <span className="truncate text-sm text-[color:var(--ink)]">
                {conv.title ?? '未命名会话'}
              </span>
              <span className="text-xs text-[color:var(--muted)]">
                {formatDate(conv.created_at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}