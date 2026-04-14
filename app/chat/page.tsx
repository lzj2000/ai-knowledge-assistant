'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatWorkspace } from '@/components/chat/chat-workspace';
import { Loading } from '@/components/ui/loading';

function ChatContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('doc') || undefined;

  return (
    <ChatWorkspace
      initialConversationId={undefined}
      initialMessages={[]}
      initialTitle={null}
      documentId={documentId}
    />
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<Loading text="加载中..." />}>
      <ChatContent />
    </Suspense>
  );
}