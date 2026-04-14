import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategoryMap } from '@/components/categories/category-map';

describe('CategoryMap', () => {
  it('渲染根分类和子分类', () => {
    render(
      <CategoryMap
        categories={[
          { id: 'cat-root', name: '制度', description: '公司制度库', parent_id: null, created_at: '2026-04-14' },
          { id: 'cat-child', name: '财务', description: '报销与预算', parent_id: 'cat-root', created_at: '2026-04-14' }
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />
    );

    expect(screen.getByText('制度')).toBeInTheDocument();
    expect(screen.getByText('财务')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新增分类' })).toBeInTheDocument();
  });
});