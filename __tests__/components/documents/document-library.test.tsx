import { render, screen } from '@testing-library/react';
import { DocumentList } from '@/components/documents/document-list';
import type { Document } from '@/types/document';

describe('DocumentList', () => {
  it('渲染可提问文档卡片', () => {
    const mockDocuments: Document[] = [
      {
        id: 'doc-1',
        title: '员工报销制度',
        file_name: 'policy.pdf',
        file_path: 'documents/policy.pdf',
        file_size: 2048,
        file_type: 'pdf',
        category_id: 'cat-1',
        version: 1,
        status: 'ready',
        chunk_count: 8,
        created_at: '2026-04-14T10:00:00.000Z',
        updated_at: '2026-04-14T10:00:00.000Z'
      }
    ];

    render(
      <DocumentList
        loading={false}
        documents={mockDocuments}
      />
    );

    expect(screen.getByText('员工报销制度')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '去提问' })).toHaveAttribute('href', '/chat?doc=doc-1');
  });
});