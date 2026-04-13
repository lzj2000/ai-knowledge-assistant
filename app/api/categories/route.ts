import { NextRequest, NextResponse } from 'next/server';
import { createCategory, getCategories, updateCategory, deleteCategory } from '@/lib/supabase/categories';
import { CreateCategoryInput, UpdateCategoryInput } from '@/types/category';

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryInput = await request.json();
    const category = await createCategory(body);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates }: { id: string } & UpdateCategoryInput = await request.json();
    const category = await updateCategory(id, updates);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少分类ID' }, { status: 400 });
  }

  try {
    await deleteCategory(id);
    return NextResponse.json({ message: '分类已删除' });
  } catch (error) {
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 });
  }
}