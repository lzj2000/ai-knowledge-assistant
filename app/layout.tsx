import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI知识助手',
  description: '企业内部知识库问答系统',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="border-b px-6 py-4">
            <nav className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold">AI知识助手</a>
              <div className="flex gap-4">
                <a href="/chat" className="text-sm hover:underline">问答</a>
                <a href="/documents" className="text-sm hover:underline">文档</a>
                <a href="/categories" className="text-sm hover:underline">分类</a>
              </div>
            </nav>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}