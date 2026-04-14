'use client';

import React from 'react';
import Link from 'next/link';
import { Document } from '@/types/document';
import { DocumentCard } from './document-card';
import { DocumentFilters } from './document-filters';
import { Loading } from '@/components/ui/loading';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export function DocumentList({ documents, loading, onDelete }: DocumentListProps) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  if (loading) {
    return <Loading text="加载文档..." />;
  }

  // 筛选逻辑
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = search === '' || doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (documents.length === 0) {
    return (
      <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-white p-8 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">Knowledge Base</p>
        <h2 className="mt-4 font-serif text-2xl text-[color:var(--ink)]">建立你的第一批知识资产</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          上传文档后，即可在指定上下文中提问。
        </p>
        <Link href="/documents/upload" className="mt-6 inline-block">
          <button className="px-4 py-2 rounded-lg bg-[color:var(--ink)] text-white text-sm font-medium hover:bg-[color:var(--accent-strong)] transition-colors">
            上传文档
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DocumentFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {filteredDocuments.length === 0 ? (
        <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-white p-6 text-center text-[color:var(--muted)]">
          <p>没有找到匹配的文档</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}