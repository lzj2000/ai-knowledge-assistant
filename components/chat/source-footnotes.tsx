import type { MessageSource } from '@/types/message';

export function SourceFootnotes({ sources }: { sources: MessageSource[] }) {
  if (!sources.length) return null;

  return (
    <div className="mt-6 border-t border-[color:var(--border-soft)] pt-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">参考来源</p>
      <div className="mt-3 space-y-3">
        {sources.map((source) => (
          <div key={source.chunk_id} className="rounded-2xl bg-[color:var(--surface)] p-4">
            <p className="text-sm font-medium text-[color:var(--ink)]">{source.document_title}</p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{source.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}