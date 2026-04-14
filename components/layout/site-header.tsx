import Link from 'next/link';

interface SiteHeaderProps {
  pathname: string;
}

export function SiteHeader({ pathname }: SiteHeaderProps) {
  return (
    <header className="border-b border-[color:var(--border-soft)] bg-[color:var(--surface)] px-6 py-4">
      <nav className="flex items-center justify-between">
        <Link href="/" className="text-xl font-medium text-[color:var(--ink)]">
          AI 知识助手
        </Link>
        <div className="flex gap-4">
          <Link
            href="/"
            className={`text-sm transition-colors ${
              pathname === '/'
                ? 'text-[color:var(--accent-strong)]'
                : 'text-[color:var(--muted)] hover:text-[color:var(--ink)]'
            }`}
          >
            首页
          </Link>
          <Link
            href="/chat"
            className={`text-sm transition-colors ${
              pathname.startsWith('/chat')
                ? 'text-[color:var(--accent-strong)]'
                : 'text-[color:var(--muted)] hover:text-[color:var(--ink)]'
            }`}
          >
            问答
          </Link>
          <Link
            href="/documents"
            className={`text-sm transition-colors ${
              pathname.startsWith('/documents')
                ? 'text-[color:var(--accent-strong)]'
                : 'text-[color:var(--muted)] hover:text-[color:var(--ink)]'
            }`}
          >
            文档
          </Link>
          <Link
            href="/categories"
            className={`text-sm transition-colors ${
              pathname.startsWith('/categories')
                ? 'text-[color:var(--accent-strong)]'
                : 'text-[color:var(--muted)] hover:text-[color:var(--ink)]'
            }`}
          >
            分类
          </Link>
        </div>
      </nav>
    </header>
  );
}