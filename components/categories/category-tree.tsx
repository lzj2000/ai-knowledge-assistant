'use client';

import React, { useState } from 'react';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (id: string, name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (name: string, description: string, parentId?: string) => Promise<void>;
}

export function CategoryTree({ categories, onEdit, onDelete, onAdd }: CategoryTreeProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    await onEdit(id, editName, editDescription);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除此分类？相关文档将移出此分类。')) {
      await onDelete(id);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAdd(newName, newDescription);
    setShowAddDialog(false);
    setNewName('');
    setNewDescription('');
  };

  const buildTree = (parentId: string | null): Category[] => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = buildTree(category.id);
    const isEditing = editingId === category.id;

    return (
      <div key={category.id} style={{ marginLeft: level * 20 }}>
        <div className="flex items-center justify-between py-2 border-b">
          {isEditing ? (
            <div className="flex gap-2 flex-1">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-2 py-1 border rounded"
              />
              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="描述"
                className="px-2 py-1 border rounded flex-1"
              />
              <Button size="sm" onClick={() => handleEdit(category.id)}>保存</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>取消</Button>
            </div>
          ) : (
            <>
              <div>
                <span className="font-medium">{category.name}</span>
                {category.description && (
                  <span className="text-sm text-gray-500 ml-2">({category.description})</span>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(category.id);
                    setEditName(category.name);
                    setEditDescription(category.description || '');
                  }}
                >
                  编辑
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(category.id)}
                >
                  删除
                </Button>
              </div>
            </>
          )}
        </div>
        {children.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };

  const rootCategories = buildTree(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">分类列表</h3>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>添加分类</Button>
      </div>

      {rootCategories.length === 0 ? (
        <p className="text-gray-500 text-center py-4">暂无分类</p>
      ) : (
        rootCategories.map(cat => renderCategory(cat))
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加分类</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3">
              <Input
                label="名称"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                label="描述"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAdd}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}