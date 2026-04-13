import { NextRequest, NextResponse } from 'next/server';
import { getDocuments } from '@/lib/supabase/documents';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get('categoryId');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const documents = await getDocuments({
      categoryId: categoryId || undefined,
      status: status || undefined,
      limit,
      offset,
    });

    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: '获取文档列表失败' }, { status: 500 });
  }
}