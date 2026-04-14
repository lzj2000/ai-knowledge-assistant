import { getConversation, getMessages } from '@/lib/supabase/conversations';
import { ChatWorkspace } from '@/components/chat/chat-workspace';
import type { Message } from '@/types/message';

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;

  // 获取会话信息和消息列表
  const conversation = await getConversation(id);
  const messages: Message[] = await getMessages(id);

  return (
    <ChatWorkspace
      initialConversationId={id}
      initialMessages={messages}
      initialTitle={conversation?.title ?? null}
    />
  );
}