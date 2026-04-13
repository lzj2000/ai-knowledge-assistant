'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatContainer } from '@/components/chat/chat-container';
import { Loading } from '@/components/ui/loading';

function ChatContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conv') || undefined;
  const documentId = searchParams.get('doc') || undefined;

  return (
    <ChatContainer
      conversationId={conversationId}
      documentId={documentId}
    />
  );
}

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">智能问答</h1>
      <Suspense fallback={<Loading text="加载中..." />}>
        <ChatContent />
      </Suspense>
    </div>
  );
}