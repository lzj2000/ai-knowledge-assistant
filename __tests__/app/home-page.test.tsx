import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/page';

vi.mock('@/lib/home/get-dashboard-summary', () => ({
  getDashboardSummary: async () => ({
    documentCount: 12,
    categoryCount: 4,
    recentDocuments: [{ id: 'doc-1', title: '报销规范', status: 'ready' }],
    recentConversations: [{ id: 'conv-1', title: '年假政策', created_at: '2026-04-14T10:00:00.000Z' }]
  })
}));

describe('HomePage', () => {
  it('渲染提问主区和知识摘要', async () => {
    const ui = await HomePage();
    render(ui);

    expect(screen.getByText('提问优先的知识中枢')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '立即开始提问' })).toHaveAttribute('href', '/chat');
  });
});