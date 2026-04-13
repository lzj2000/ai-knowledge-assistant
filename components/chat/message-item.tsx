import React from 'react';
import { Message } from '@/types/message';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">引用来源：</p>
            {message.sources.map((source, index) => (
              <div key={index} className="text-xs text-gray-600 mb-1">
                <span className="font-medium">[{source.document_title}]</span>
                <span className="ml-2 text-gray-500">
                  {source.content.slice(0, 100)}...
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}