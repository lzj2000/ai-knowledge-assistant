import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-4xl font-bold mb-4">AI知识助手</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        上传文档，智能问答。基于RAG技术，让知识检索更精准。
      </p>
      <div className="flex gap-4">
        <Link href="/chat">
          <Button variant="primary">开始问答</Button>
        </Link>
        <Link href="/documents">
          <Button variant="secondary">管理文档</Button>
        </Link>
      </div>
    </div>
  );
}