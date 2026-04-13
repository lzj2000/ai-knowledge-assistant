'use client';

import React, { useState, useRef } from 'react';
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
      setFile(null);
      setTitle('');
      setCategoryId('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
          <div className="text-sm">
            <p className="font-medium">{file.name}</p>
            <p className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="text-gray-500">
            <p>拖拽文件到这里，或点击选择</p>
            <p className="text-sm mt-2">支持 PDF, DOCX, MD, TXT（最大10MB）</p>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">分类</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
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