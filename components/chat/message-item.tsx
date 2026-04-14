import React from 'react';
import { Message } from '@/types/message';
import { mapStoredMessageToUIMessage } from '@/lib/chat/message-parts';
import { AssistantAnswerCard } from '@/components/chat/assistant-answer-card';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageItem({ message, isStreaming }: MessageItemProps) {
  const isUser = message.role === 'user';

  // 用户消息保持原有样式
  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] px-4 py-3 rounded-[16px] bg-[color:var(--ink)] text-white">
          <p className="whitespace-pre-wrap leading-7">{message.content}</p>
        </div>
      </div>
    );
  }

  // 助手消息使用新的 AssistantAnswerCard
  const uiMessage = mapStoredMessageToUIMessage(message);
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%]">
        <AssistantAnswerCard message={uiMessage} isStreaming={isStreaming ?? false} />
      </div>
    </div>
  );
}