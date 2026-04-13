'use client';

import React, { useState, useEffect } from 'react';
import { UploadZone } from '@/components/documents/upload-zone';
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
      <h1 className="text-2xl font-bold mb-6">上传文档</h1>
      <UploadZone onUpload={handleUpload} categories={categories} />
    </div>
  );
}