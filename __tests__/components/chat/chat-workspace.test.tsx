import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ChatWorkspace } from '@/components/chat/chat-workspace';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/chat',
}));

// Mock useMediaQuery
vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: () => false, // desktop mode
}));

// Mock useToast
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

global.fetch = vi.fn(async (input: RequestInfo | URL) => {
  if (String(input).startsWith('/api/conversations?')) {
    return new Response(JSON.stringify([{ id: 'conv-1', title: '报销流程', created_at: '2026-04-14T10:00:00.000Z' }]), { status: 200 });
  }
  return new Response(JSON.stringify([]), { status: 200 });
}) as typeof fetch;

describe('ChatWorkspace', () => {
  it('渲染会话侧栏和输入区', async () => {
    render(<ChatWorkspace initialConversationId={undefined} initialMessages={[]} initialTitle={null} />);

    expect(screen.getByText('最近会话')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入你想问的问题，Shift + Enter 换行')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('报销流程')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText('输入你想问的问题，Shift + Enter 换行'), '公司报销上限是多少？');
    expect(screen.getByRole('button', { name: '发送' })).toBeEnabled();
  });
});