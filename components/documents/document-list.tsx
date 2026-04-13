'use client';

import React from 'react';
import { Document } from '@/types/document';
import { DocumentCard } from './document-card';
import { Loading } from '@/components/ui/loading';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export function DocumentList({ documents, loading, onDelete }: DocumentListProps) {
  if (loading) {
    return <Loading text="加载文档..." />;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>暂无文档</p>
        <a href="/documents/upload" className="text-blue-600 hover:underline mt-2 block">
          上传第一个文档
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}