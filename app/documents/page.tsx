'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Document } from '@/types/document';
import { DocumentList } from '@/components/documents/document-list';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function DocumentsPage() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch {
      showToast('error', '加载文档失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除失败');

      showToast('success', '文档已删除');
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch {
      showToast('error', '删除失败');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader
        label="Knowledge Base"
        title="文档管理"
        description="上传和管理你的知识文档，在指定上下文中提问。"
        action={
          <Link href="/documents/upload">
            <Button>上传文档</Button>
          </Link>
        }
      />

      <DocumentList
        documents={documents}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}