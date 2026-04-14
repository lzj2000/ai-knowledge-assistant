'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ChatComposerProps {
  onSend: (question: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
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
    // 中文输入法组合输入时不触发发送
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-4 shadow-sm">
      <div className="flex gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你想问的问题，Shift + Enter 换行"
          disabled={disabled || sending}
          className="flex-1 px-4 py-3 rounded-xl border border-[color:var(--border-soft)] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-strong)] text-[color:var(--ink)] placeholder:text-[color:var(--muted)]"
          rows={3}
        />
        <Button
          onClick={handleSubmit}
          loading={sending}
          disabled={!input.trim() || disabled}
          size="lg"
        >
          发送
        </Button>
      </div>
      <p className="text-xs text-[color:var(--muted)] mt-3">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  );
}