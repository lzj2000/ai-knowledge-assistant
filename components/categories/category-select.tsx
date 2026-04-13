'use client';

import React from 'react';
import { Category } from '@/types/category';

interface CategorySelectProps {
  categories: Category[];
  value?: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
}

export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = '选择分类',
}: CategorySelectProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{placeholder}</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}