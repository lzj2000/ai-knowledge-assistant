import React from 'react';
import Link from 'next/link';
import { Document } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

const statusLabels = {
  processing: '处理中',
  ready: '就绪',
  error: '错误',
};

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const handleDelete = async () => {
    if (!onDelete) return;
    if (confirm('确定删除此文档？')) {
      onDelete(document.id);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">
            {document.file_type ?? 'FILE'}
          </p>
          <h3 className="text-xl font-medium text-[color:var(--ink)]">{document.title}</h3>
          <p className="text-sm text-[color:var(--muted)]">{document.file_name}</p>
        </div>
        <span className="rounded-full border border-[color:var(--border-soft)] px-3 py-1 text-xs text-[color:var(--muted)]">
          {statusLabels[document.status]}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href={`/chat?doc=${document.id}`}>
          <Button size="sm">去提问</Button>
        </Link>
        <Button variant="secondary" size="sm" onClick={handleDelete}>删除</Button>
      </div>
    </Card>
  );
}