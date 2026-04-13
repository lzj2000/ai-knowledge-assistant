export type DocumentStatus = 'processing' | 'ready' | 'error';

export type FileType = 'pdf' | 'docx' | 'md' | 'txt';

export interface Document {
  id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: FileType | null;
  category_id: string | null;
  version: number;
  status: DocumentStatus;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  title: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: FileType;
  category_id?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  category_id?: string | null;
  status?: DocumentStatus;
  chunk_count?: number;
}