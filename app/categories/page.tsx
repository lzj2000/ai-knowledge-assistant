'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types/category';
import { CategoryTree } from '@/components/categories/category-tree';
import { useToast } from '@/components/ui/toast';

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      showToast('error', '加载分类失败');
    }
  };

  const handleEdit = async (id: string, name: string, description: string) => {
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description }),
      });
      showToast('success', '分类已更新');
      loadCategories();
    } catch (error) {
      showToast('error', '更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      showToast('success', '分类已删除');
      loadCategories();
    } catch (error) {
      showToast('error', '删除失败');
    }
  };

  const handleAdd = async (name: string, description: string) => {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      showToast('success', '分类已添加');
      loadCategories();
    } catch (error) {
      showToast('error', '添加失败');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">分类管理</h1>
      <CategoryTree
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  );
}