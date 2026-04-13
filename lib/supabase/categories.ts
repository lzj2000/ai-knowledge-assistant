import { supabaseAdmin } from './client';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category';

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getCategory(id: string): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}