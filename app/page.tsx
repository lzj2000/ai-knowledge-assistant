import { getDashboardSummary } from '@/lib/home/get-dashboard-summary';
import { PageHeader } from '@/components/layout/page-header';
import { HomeAskPanel } from '@/components/home/home-ask-panel';
import { KnowledgeSummaryGrid } from '@/components/home/knowledge-summary-grid';
import { RecentConversationList } from '@/components/home/recent-conversation-list';

export default async function HomePage() {
  const summary = await getDashboardSummary();

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <PageHeader
        label="Knowledge Hub"
        title="提问优先的知识中枢"
        description="在这里，提问是获取知识的主要方式。系统已准备好你的知识库，随时可以开始问答。"
      />

      <div className="mt-8 space-y-8">
        <HomeAskPanel />

        <KnowledgeSummaryGrid
          documentCount={summary.documentCount}
          categoryCount={summary.categoryCount}
          recentDocuments={summary.recentDocuments}
        />

        <RecentConversationList conversations={summary.recentConversations} />
      </div>
    </div>
  );
}