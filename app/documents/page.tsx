'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Document } from '@/types/document';
import { DocumentList } from '@/components/documents/document-list';
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
    } catch (error) {
      showToast('error', '加载文档失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除失败');

      showToast('success', '文档已删除');
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch (error) {
      showToast('error', '删除失败');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">文档管理</h1>
        <Link href="/documents/upload">
          <Button variant="primary">上传文档</Button>
        </Link>
      </div>

      <DocumentList
        documents={documents}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}