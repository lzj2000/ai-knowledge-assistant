'use client';

import React from 'react';
import { ChatContainer } from '@/components/chat/chat-container';

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 使用 React.use 来解包 Promise
  const resolvedParams = React.use(params);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">对话详情</h1>
      <ChatContainer conversationId={resolvedParams.id} />
    </div>
  );
}