import { Streamdown } from 'streamdown';
import { getAssistantSources, getMessageText } from '@/lib/chat/message-parts';
import type { KnowledgeUIMessage } from '@/types/chat';
import { SourceFootnotes } from '@/components/chat/source-footnotes';

export function AssistantAnswerCard({
  message,
  isStreaming
}: {
  message: KnowledgeUIMessage;
  isStreaming: boolean;
}) {
  const text = getMessageText(message);
  const sources = getAssistantSources(message);

  return (
    <article className="rounded-[28px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-6 shadow-[var(--shadow-card)]">
      <div className="prose prose-slate max-w-none">
        <Streamdown parseIncompleteMarkdown>{text}</Streamdown>
      </div>
      {isStreaming ? <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">生成中</p> : null}
      <SourceFootnotes sources={sources} />
    </article>
  );
}