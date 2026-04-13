import { NextRequest, NextResponse } from 'next/server';
import { getMessages } from '@/lib/supabase/conversations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const messages = await getMessages(id);
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: '获取消息失败' }, { status: 500 });
  }
}