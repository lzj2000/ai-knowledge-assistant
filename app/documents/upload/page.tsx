'use client';

import React, { useState, useEffect } from 'react';
import { UploadZone } from '@/components/documents/upload-zone';
import { UploadGuide } from '@/components/documents/upload-guide';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/components/ui/toast';

export default function UploadPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  const handleUpload = async (file: File, title: string, categoryId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (categoryId) {
      formData.append('categoryId', categoryId);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      showToast('error', error.error || '上传失败');
      throw new Error(error.error);
    }

    showToast('success', '文档上传成功，正在处理中');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <PageHeader
        label="Upload"
        title="上传文档"
        description="导入知识文档，系统会自动解析并建立索引。"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="order-2 md:order-1">
          <UploadGuide />
        </div>
        <div className="order-1 md:order-2">
          <UploadZone onUpload={handleUpload} categories={categories} />
        </div>
      </div>
    </div>
  );
}