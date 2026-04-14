import { NextRequest, NextResponse } from 'next/server';
import { getConversations } from '@/lib/supabase/conversations';

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

  try {
    const conversations = await getConversations(limit);
    return NextResponse.json(conversations);
  } catch {
    return NextResponse.json({ error: '获取对话列表失败' }, { status: 500 });
  }
}