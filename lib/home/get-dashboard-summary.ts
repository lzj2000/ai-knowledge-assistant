import { getCategories } from '@/lib/supabase/categories';
import { getConversations } from '@/lib/supabase/conversations';
import { getDocuments } from '@/lib/supabase/documents';

export interface DashboardSummary {
  documentCount: number;
  categoryCount: number;
  recentDocuments: Awaited<ReturnType<typeof getDocuments>>;
  recentConversations: Awaited<ReturnType<typeof getConversations>>;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [recentDocuments, recentConversations, categories] = await Promise.all([
    getDocuments({ limit: 4, offset: 0 }),
    getConversations(5),
    getCategories()
  ]);

  return {
    documentCount: recentDocuments.length,
    categoryCount: categories.length,
    recentDocuments,
    recentConversations
  };
}