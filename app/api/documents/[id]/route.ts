import { NextRequest, NextResponse } from 'next/server';
import { deleteDocument, getDocument } from '@/lib/supabase/documents';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const document = await getDocument(id);

    if (document) {
      await supabaseAdmin.storage
        .from('documents')
        .remove([document.file_path]);
    }

    await deleteDocument(id);

    return NextResponse.json({ message: '文档已删除' });
  } catch (error) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await getDocument(id);

    if (!document) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json({ error: '获取文档失败' }, { status: 500 });
  }
}