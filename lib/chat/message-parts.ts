import type { Message } from '@/types/message';
import type { KnowledgeUIMessage } from '@/types/chat';

export function getMessageText(message: KnowledgeUIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export function getAssistantSources(message: KnowledgeUIMessage) {
  const sourcePart = message.parts.find((part) => part.type === 'data-sources');
  return sourcePart?.data ?? [];
}

export function mapStoredMessageToUIMessage(message: Message): KnowledgeUIMessage {
  const parts: KnowledgeUIMessage['parts'] = [{ type: 'text', text: message.content }];

  if (message.role === 'assistant' && message.sources?.length) {
    parts.push({ type: 'data-sources', data: message.sources });
  }

  return {
    id: message.id,
    role: message.role,
    parts,
    metadata: {
      conversationId: message.conversation_id
    }
  };
}