'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  onUpload: (file: File, title: string, categoryId?: string) => Promise<void>;
  categories?: { id: string; name: string }[];
}

export function UploadZone({ onUpload, categories = [] }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setTitle(droppedFile.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file, title, categoryId);
      setUploadSuccess(true);
      // 清空表单
      setFile(null);
      setTitle('');
      setCategoryId('');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setUploadSuccess(false);
  };

  if (uploadSuccess) {
    return (
      <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-white p-8 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">Upload Success</p>
        <h2 className="mt-4 font-serif text-2xl text-[color:var(--ink)]">文档上传成功</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          系统正在解析和建立索引，稍后即可开始提问。
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/chat">
            <Button>去提问</Button>
          </Link>
          <Link href="/documents">
            <Button variant="secondary">查看文档列表</Button>
          </Link>
          <Button variant="secondary" onClick={handleReset}>继续上传</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`rounded-[24px] border-2 p-12 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-[color:var(--accent)] bg-[color:var(--surface)]'
            : 'border-[color:var(--border-soft)] bg-white'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.md,.txt"
          className="hidden"
          onChange={handleFileSelect}
        />

        {file ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">Selected File</p>
            <p className="text-lg font-medium text-[color:var(--ink)]">{file.name}</p>
            <p className="text-sm text-[color:var(--muted)]">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">Drop Zone</p>
            <p className="text-lg text-[color:var(--ink)]">拖拽文件到这里，或点击选择</p>
            <p className="text-sm text-[color:var(--muted)]">
              支持 PDF, DOCX, MD, TXT（最大10MB）
            </p>
          </div>
        )}
      </div>

      {file && (
        <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--ink)] mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[color:var(--border-soft)] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-strong)]"
            />
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[color:var(--ink)] mb-2">分类</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[color:var(--border-soft)] text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-strong)]"
              >
                <option value="">不选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleUpload}
            loading={uploading}
            className="w-full"
          >
            上传文档
          </Button>
        </div>
      )}
    </div>
  );
}