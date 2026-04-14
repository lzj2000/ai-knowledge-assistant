import { NextResponse } from 'next/server';
import { getConversation } from '@/lib/supabase/conversations';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const conversation = await getConversation(id);

    if (!conversation) {
      return NextResponse.json({ error: '对话不存在' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: '获取对话失败' }, { status: 500 });
  }
}