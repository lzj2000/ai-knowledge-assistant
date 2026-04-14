'use client';

import React from 'react';

interface DocumentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function DocumentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange
}: DocumentFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索文档标题..."
          className="w-full px-4 py-2 rounded-lg border border-[color:var(--border-soft)] bg-white text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-strong)]"
        />
      </div>
      <div>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[color:var(--border-soft)] bg-white text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-strong)]"
        >
          <option value="">全部状态</option>
          <option value="ready">就绪</option>
          <option value="processing">处理中</option>
          <option value="error">错误</option>
        </select>
      </div>
    </div>
  );
}