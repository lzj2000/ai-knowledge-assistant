import Link from 'next/link';
import type { Document } from '@/types/document';

interface KnowledgeSummaryGridProps {
  documentCount: number;
  categoryCount: number;
  recentDocuments: Document[];
}

export function KnowledgeSummaryGrid({
  documentCount,
  categoryCount,
  recentDocuments
}: KnowledgeSummaryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">
          知识库
        </p>
        <p className="mt-2 font-serif text-2xl text-[color:var(--ink)]">
          {documentCount} 篇文档
        </p>
        <Link
          href="/documents"
          className="mt-3 inline-block text-sm text-[color:var(--muted)] hover:text-[color:var(--accent-strong)]"
        >
          查看全部 →
        </Link>
      </div>

      <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">
          分类体系
        </p>
        <p className="mt-2 font-serif text-2xl text-[color:var(--ink)]">
          {categoryCount} 个分类
        </p>
        <Link
          href="/categories"
          className="mt-3 inline-block text-sm text-[color:var(--muted)] hover:text-[color:var(--accent-strong)]"
        >
          知识地图 →
        </Link>
      </div>

      <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">
          最近上传
        </p>
        {recentDocuments.length > 0 ? (
          <div className="mt-2 space-y-1">
            {recentDocuments.slice(0, 3).map((doc) => (
              <Link
                key={doc.id}
                href={`/chat?doc=${doc.id}`}
                className="block truncate text-sm text-[color:var(--ink)] hover:text-[color:var(--accent-strong)]"
              >
                {doc.title}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            暂无文档，上传第一个吧
          </p>
        )}
        <Link
          href="/documents/upload"
          className="mt-3 inline-block text-sm text-[color:var(--muted)] hover:text-[color:var(--accent-strong)]"
        >
          上传文档 →
        </Link>
      </div>
    </div>
  );
}