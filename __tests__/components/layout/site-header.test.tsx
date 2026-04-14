import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from '@/components/layout/site-header';

describe('SiteHeader', () => {
  it('渲染品牌和全局导航', () => {
    render(<SiteHeader pathname="/chat" />);

    expect(screen.getByText('AI 知识助手')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '问答' })).toHaveAttribute('href', '/chat');
  });
});