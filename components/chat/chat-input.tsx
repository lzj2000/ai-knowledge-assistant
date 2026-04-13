'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (question: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      await onSend(input.trim());
      setInput('');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入问题..."
          disabled={disabled || sending}
          className="flex-1 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <Button
          onClick={handleSubmit}
          loading={sending}
          disabled={!input.trim() || disabled}
        >
          发送
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  );
}