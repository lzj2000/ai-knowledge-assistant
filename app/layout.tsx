import type { Metadata } from 'next';
import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { SiteHeader } from '@/components/layout/site-header';
import { ConversationProvider } from '@/contexts/conversation-context';

const sans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans'
});

const serif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-serif'
});

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
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased bg-[color:var(--page)]`}>
        <ToastProvider>
          <ConversationProvider>
            <div className="h-screen flex flex-col overflow-hidden">
              <SiteHeader pathname="/" />
              <main className="flex-1 overflow-hidden">
                {children}
              </main>
            </div>
          </ConversationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}