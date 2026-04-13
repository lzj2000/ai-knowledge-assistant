export interface Category {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parent_id?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  parent_id?: string | null;
}