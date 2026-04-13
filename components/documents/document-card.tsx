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

const statusColors = {
  processing: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
};

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const handleDelete = async () => {
    if (!onDelete) return;
    if (confirm('确定删除此文档？')) {
      onDelete(document.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-lg">{document.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{document.file_name}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded ${statusColors[document.status]}`}>
            {statusLabels[document.status]}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span>{document.chunk_count} 个分块</span>
          <span>{document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : '-'}</span>
        </div>

        <div className="flex gap-2 mt-4">
          {document.status === 'ready' && (
            <Link href={`/chat?doc=${document.id}`}>
              <Button variant="primary" size="sm">提问</Button>
            </Link>
          )}
          <Button variant="secondary" size="sm" onClick={handleDelete}>
            删除
          </Button>
        </div>
      </div>
    </Card>
  );
}