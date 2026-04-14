'use client';

import { useState } from 'react';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';

function buildTree(categories: Category[], parentId: string | null): Category[] {
  return categories.filter((category) => category.parent_id === parentId);
}

function CategoryNode({
  category,
  allCategories,
  depth,
  onEdit,
  onDelete,
  onAdd
}: {
  category: Category;
  allCategories: Category[];
  depth: number;
  onEdit: (id: string, name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (name: string, description: string, parentId?: string) => Promise<void>;
}) {
  const children = buildTree(allCategories, category.id);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editDesc, setEditDesc] = useState(category.description ?? '');
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildDesc, setNewChildDesc] = useState('');

  const handleEditSave = async () => {
    await onEdit(category.id, editName, editDesc);
    setEditing(false);
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) return;
    await onAdd(newChildName, newChildDesc, category.id);
    setShowAddChildDialog(false);
    setNewChildName('');
    setNewChildDesc('');
  };

  return (
    <div className={depth > 0 ? 'ml-6 mt-3' : ''}>
      <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white p-5">
        {editing ? (
          <div className="space-y-3">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="分类名称" />
            <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="分类描述（可选）" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEditSave}>保存</Button>
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>取消</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h3 className={depth === 0 ? 'text-2xl font-medium text-[color:var(--ink)]' : 'text-lg font-medium text-[color:var(--ink)]'}>
                  {category.name}
                </h3>
                {category.description ? (
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{category.description}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>编辑</Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(category.id)}>删除</Button>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={() => setShowAddChildDialog(true)}>
                添加子分类
              </Button>
            </div>
          </>
        )}
      </div>
      {children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}

      <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加子分类</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3">
              <Input
                label="名称"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="子分类名称"
              />
              <Input
                label="描述"
                value={newChildDesc}
                onChange={(e) => setNewChildDesc(e.target.value)}
                placeholder="分类描述（可选）"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddChildDialog(false)}>取消</Button>
            <Button onClick={handleAddChild}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CategoryMap({
  categories,
  onEdit,
  onDelete,
  onAdd
}: {
  categories: Category[];
  onEdit: (id: string, name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (name: string, description: string, parentId?: string) => Promise<void>;
}) {
  const roots = buildTree(categories, null);
  const [showAddRootDialog, setShowAddRootDialog] = useState(false);
  const [newRootName, setNewRootName] = useState('');
  const [newRootDesc, setNewRootDesc] = useState('');

  const handleAddRoot = async () => {
    if (!newRootName.trim()) return;
    await onAdd(newRootName, newRootDesc);
    setShowAddRootDialog(false);
    setNewRootName('');
    setNewRootDesc('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        label="Knowledge Taxonomy"
        title="知识地图"
        description="构建知识的层级结构，让信息更有组织感"
        action={
          <Button onClick={() => setShowAddRootDialog(true)}>新增分类</Button>
        }
      />
      <div className="space-y-4">
        {roots.map((root) => (
          <CategoryNode
            key={root.id}
            category={root}
            allCategories={categories}
            depth={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onAdd={onAdd}
          />
        ))}
      </div>

      <Dialog open={showAddRootDialog} onOpenChange={setShowAddRootDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增根分类</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3">
              <Input
                label="名称"
                value={newRootName}
                onChange={(e) => setNewRootName(e.target.value)}
                placeholder="分类名称"
              />
              <Input
                label="描述"
                value={newRootDesc}
                onChange={(e) => setNewRootDesc(e.target.value)}
                placeholder="分类描述（可选）"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddRootDialog(false)}>取消</Button>
            <Button onClick={handleAddRoot}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}