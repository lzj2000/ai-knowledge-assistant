export interface ChunkMetadata {
  page?: number;
  position?: number;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  metadata: ChunkMetadata | null;
  embedding: number[] | null;
  created_at: string;
}

export interface CreateChunkInput {
  document_id: string;
  content: string;
  chunk_index: number;
  metadata?: ChunkMetadata;
  embedding?: number[];
}