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
        className={`max-w-[80%] px-4 py-3 rounded-[16px] ${
          isUser
            ? 'bg-[color:var(--ink)] text-white'
            : 'bg-[color:var(--surface)] border border-[color:var(--border-soft)] text-[color:var(--ink)]'
        }`}
      >
        <p className="whitespace-pre-wrap leading-7">{message.content}</p>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[color:var(--border-soft)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)] mb-3">参考来源</p>
            {message.sources.map((source, index) => (
              <div key={index} className="rounded-2xl bg-[color:var(--surface-strong)] p-3 mb-2">
                <p className="text-sm font-medium text-[color:var(--ink)]">{source.document_title}</p>
                <p className="mt-1 text-sm leading-7 text-[color:var(--muted)]">
                  {source.content.slice(0, 200)}{source.content.length > 200 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}