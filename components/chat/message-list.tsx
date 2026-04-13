import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/message';
import { MessageItem } from './message-item';
import { Loading } from '@/components/ui/loading';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>请输入问题开始对话</p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}

      {loading && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <Loading size="sm" text="思考中..." />
          </div>
        </div>
      )}
    </div>
  );
}