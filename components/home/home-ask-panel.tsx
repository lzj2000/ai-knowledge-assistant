'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const suggestedQuestions = [
  '公司报销流程是怎样的？',
  '年假政策有哪些规定？',
  '如何申请加班？'
];

export function HomeAskPanel() {
  return (
    <div className="rounded-[32px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-8 shadow-[0_8px_32px_rgba(30,36,48,0.08)]">
      <h2 className="text-center font-serif text-3xl text-[color:var(--ink)]">
        有什么想问的？
      </h2>
      <p className="mt-3 text-center text-sm leading-7 text-[color:var(--muted)]">
        输入问题，从知识库中获取答案
      </p>

      <div className="mt-8">
        <Link href="/chat" className="block">
          <Button className="w-full py-4 text-lg" size="lg">
            立即开始提问
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {suggestedQuestions.map((question) => (
          <Link
            key={question}
            href={`/chat?q=${encodeURIComponent(question)}`}
            className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-2 text-sm text-[color:var(--muted)] transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-strong)]"
          >
            {question}
          </Link>
        ))}
      </div>
    </div>
  );
}