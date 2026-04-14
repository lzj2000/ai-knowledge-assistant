# 知识中枢改版实施计划

> **给执行型 agent 的要求：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务逐步执行。步骤使用 checkbox（`- [ ]`）格式跟踪。

**目标：** 将当前应用重构为“编辑部感”的知识中枢，并把聊天链路迁移到 `Vercel AI SDK + streamdown`，同时保留现有 RAG 与 Supabase 持久化模型。

**架构：** 保留现有 App Router、Supabase 表结构和检索逻辑，在此基础上新增统一视觉外壳、页面级展示组件和聊天集成层。`app/api/chat/route.ts` 继续承担会话创建、消息落库、检索拼装和模型流式响应的职责；客户端聊天状态统一交给 `useChat` 管理，并通过结构化数据 part 承载 `conversationId` 与 `sources`。

**技术栈：** Next.js 16.2.3、React 19.2.4、Tailwind CSS 4、Supabase、Vercel AI SDK、OpenAI-compatible GLM provider、`streamdown`、Vitest、Testing Library、Zod

---

## 文件结构

### 新建文件

- `vitest.config.ts`
- `vitest.setup.ts`
- `types/chat.ts`（含 `ChatRequestBody`）
- `lib/chat/message-parts.ts`
- `lib/chat/glm-provider.ts`
- `lib/chat/knowledge-prompt.ts`
- `lib/home/get-dashboard-summary.ts`
- `components/layout/site-header.tsx`
- `components/layout/page-header.tsx`
- `components/home/home-ask-panel.tsx`
- `components/home/knowledge-summary-grid.tsx`
- `components/home/recent-conversation-list.tsx`
- `components/documents/document-filters.tsx`
- `components/documents/upload-guide.tsx`
- `components/categories/category-map.tsx`
- `components/chat/conversation-sidebar.tsx`
- `components/chat/chat-workspace.tsx`
- `components/chat/chat-composer.tsx`
- `components/chat/assistant-answer-card.tsx`
- `components/chat/source-footnotes.tsx`
- `hooks/use-conversation-list.ts`
- `__tests__/lib/chat/message-parts.test.ts`
- `__tests__/components/layout/site-header.test.tsx`
- `__tests__/app/home-page.test.tsx`
- `__tests__/components/documents/document-library.test.tsx`
- `__tests__/components/categories/category-map.test.tsx`
- `__tests__/components/chat/chat-workspace.test.tsx`
- `__tests__/app/api/chat/route.test.ts`
- `__tests__/components/chat/assistant-answer-card.test.tsx`

### 修改文件

- `package.json`
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/chat/page.tsx`
- `app/chat/[id]/page.tsx`
- `app/documents/page.tsx`
- `app/documents/upload/page.tsx`
- `app/categories/page.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/dialog.tsx`（补充 DialogFooter 等）
- `components/documents/document-card.tsx`
- `components/documents/document-list.tsx`
- `components/documents/upload-zone.tsx`
- `components/categories/category-tree.tsx`
- `components/chat/chat-container.tsx`
- `components/chat/chat-input.tsx`
- `components/chat/message-list.tsx`
- `components/chat/message-item.tsx`
- `app/api/chat/route.ts`
- `lib/llm/glm.ts`
- `lib/rag/retrieval.ts`（增加 `documentId` 过滤）
- `lib/supabase/chunks.ts`（如有需要）
- `supabase/migrations/001_initial_schema.sql`（增加 `match_chunks_by_doc` 函数）

---

### Task 1：补齐测试基线与聊天类型层

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `types/chat.ts`
- Create: `lib/chat/message-parts.ts`
- Test: `__tests__/lib/chat/message-parts.test.ts`

- [ ] **Step 1：先写失败测试**

创建 `__tests__/lib/chat/message-parts.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import type { Message } from '@/types/message';
import { getAssistantSources, getMessageText, mapStoredMessageToUIMessage } from '@/lib/chat/message-parts';

const storedAssistant: Message = {
  id: 'm-2',
  conversation_id: 'c-1',
  role: 'assistant',
  content: '答案正文',
  created_at: '2026-04-14T10:00:00.000Z',
  sources: [
    {
      document_id: 'doc-1',
      document_title: '员工手册',
      chunk_id: 'chunk-1',
      content: '关于报销流程的段落'
    }
  ]
};

describe('message parts helpers', () => {
  it('能把数据库消息映射成 UI 消息，并提取文本与来源', () => {
    const uiMessage = mapStoredMessageToUIMessage(storedAssistant);

    expect(uiMessage.parts.some((part) => part.type === 'text')).toBe(true);
    expect(getAssistantSources(uiMessage)).toEqual(storedAssistant.sources);
    expect(getMessageText(uiMessage)).toBe('答案正文');
  });
});
```

- [ ] **Step 2：运行测试，确认它先失败**

```bash
pnpm vitest run __tests__/lib/chat/message-parts.test.ts
```

预期：失败，报 `@/lib/chat/message-parts` 或 `@/types/chat` 不存在。

- [ ] **Step 3：补依赖、测试配置和类型层**

修改 `package.json`，新增脚本与依赖：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@ai-sdk/openai-compatible": "^0.0.1",
    "ai": "^5.0.0",
    "streamdown": "^1.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^25.0.0",
    "vitest": "^2.1.0"
  }
}
```

创建 `vitest.config.ts`：

```ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname)
    }
  }
});
```

创建 `vitest.setup.ts`：

```ts
import '@testing-library/jest-dom/vitest';
```

创建 `types/chat.ts`：

```ts
import { z } from 'zod';
import type { UIMessage } from 'ai';
import type { MessageSource } from '@/types/message';

export const sourcePartSchema = z.object({
  document_id: z.string(),
  document_title: z.string(),
  chunk_id: z.string(),
  content: z.string()
});

export const conversationPartSchema = z.object({
  conversationId: z.string()
});

export type KnowledgeMessageMetadata = {
  conversationId?: string;
};

export type KnowledgeDataPartMap = {
  sources: z.infer<typeof sourcePartSchema>[];
  conversation: z.infer<typeof conversationPartSchema>;
};

export type KnowledgeUIMessage = UIMessage<KnowledgeMessageMetadata, KnowledgeDataPartMap>;

// API 路由请求体类型
export interface ChatRequestBody {
  message: KnowledgeUIMessage;
  conversationId?: string;
  documentId?: string;
}
```

创建 `lib/chat/message-parts.ts`：

```ts
import type { Message } from '@/types/message';
import type { KnowledgeUIMessage } from '@/types/chat';

export function getMessageText(message: KnowledgeUIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export function getAssistantSources(message: KnowledgeUIMessage) {
  const sourcePart = message.parts.find((part) => part.type === 'data-sources');
  return sourcePart?.data ?? [];
}

export function mapStoredMessageToUIMessage(message: Message): KnowledgeUIMessage {
  const parts: KnowledgeUIMessage['parts'] = [{ type: 'text', text: message.content }];

  if (message.role === 'assistant' && message.sources?.length) {
    parts.push({ type: 'data-sources', data: message.sources });
  }

  return {
    id: message.id,
    role: message.role,
    parts,
    metadata: {
      conversationId: message.conversation_id
    }
  };
}
```

- [ ] **Step 4：安装依赖并确认测试通过**

```bash
pnpm install
pnpm vitest run __tests__/lib/chat/message-parts.test.ts
```

- [ ] **Step 5：提交**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts vitest.setup.ts types/chat.ts lib/chat/message-parts.ts __tests__/lib/chat/message-parts.test.ts
git commit -m "test: add chat message helpers and vitest harness"
```

### Task 2：建立全局视觉系统与外壳

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/card.tsx`
- Create: `components/layout/site-header.tsx`
- Create: `components/layout/page-header.tsx`
- Test: `__tests__/components/layout/site-header.test.tsx`

- [ ] **Step 1：写头部组件失败测试**

```tsx
import { render, screen } from '@testing-library/react';
import { SiteHeader } from '@/components/layout/site-header';

describe('SiteHeader', () => {
  it('渲染品牌和全局导航', () => {
    render(<SiteHeader pathname="/chat" />);

    expect(screen.getByText('AI 知识助手')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '问答' })).toHaveAttribute('href', '/chat');
  });
});
```

- [ ] **Step 2：实现外壳与设计 token**

创建 `components/layout/site-header.tsx`、`components/layout/page-header.tsx`，并修改 `app/layout.tsx`、`app/globals.css`、`components/ui/button.tsx`、`components/ui/card.tsx`。

**字体加载（`app/layout.tsx`）：**

```ts
import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';

const sans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans'
});

const serif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-serif'
});

// 在 <body> 上添加: className={`${sans.variable} ${serif.variable} font-sans antialiased`}
```

关键 token：

```css
:root {
  --page: #f4efe6;
  --surface: rgba(255, 252, 247, 0.92);
  --surface-strong: #fffdf8;
  --ink: #1e2430;
  --muted: #596170;
  --accent: #8b5e34;
  --accent-strong: #2d4d74;
  --border-soft: rgba(34, 41, 51, 0.08);
  --border-strong: rgba(34, 41, 51, 0.16);
}
```

```tsx
const variants = {
  primary: 'bg-[color:var(--ink)] text-white hover:bg-[color:var(--accent-strong)]',
  secondary: 'bg-white text-[color:var(--ink)] ring-1 ring-[color:var(--border-strong)] hover:bg-[color:var(--surface)]',
  danger: 'bg-[#9f3b2f] text-white hover:bg-[#872f24]'
};
```

- [ ] **Step 3：运行测试与 lint**

```bash
pnpm vitest run __tests__/components/layout/site-header.test.tsx
pnpm lint
```

- [ ] **Step 4：提交**

```bash
git add app/layout.tsx app/globals.css components/layout/site-header.tsx components/layout/page-header.tsx components/ui/button.tsx components/ui/card.tsx __tests__/components/layout/site-header.test.tsx
git commit -m "feat: add editorial shell and design tokens"
```

### Task 3：首页改造成“提问优先”的知识中枢

**Files:**
- Modify: `app/page.tsx`
- Create: `lib/home/get-dashboard-summary.ts`
- Create: `components/home/home-ask-panel.tsx`
- Create: `components/home/knowledge-summary-grid.tsx`
- Create: `components/home/recent-conversation-list.tsx`
- Test: `__tests__/app/home-page.test.tsx`

- [ ] **Step 1：写首页失败测试**

```tsx
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

vi.mock('@/lib/home/get-dashboard-summary', () => ({
  getDashboardSummary: async () => ({
    documentCount: 12,
    categoryCount: 4,
    recentDocuments: [{ id: 'doc-1', title: '报销规范', status: 'ready' }],
    recentConversations: [{ id: 'conv-1', title: '年假政策', created_at: '2026-04-14T10:00:00.000Z' }]
  })
}));

describe('HomePage', () => {
  it('渲染提问主区和知识摘要', async () => {
    const ui = await HomePage();
    render(ui);

    expect(screen.getByText('提问优先的知识中枢')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '立即开始提问' })).toHaveAttribute('href', '/chat');
  });
});
```

- [ ] **Step 2：实现首页数据与 UI**

创建 `lib/home/get-dashboard-summary.ts`：

```ts
import { getCategories } from '@/lib/supabase/categories';
import { getConversations } from '@/lib/supabase/conversations';
import { getDocuments } from '@/lib/supabase/documents';

export async function getDashboardSummary() {
  const [recentDocuments, recentConversations, categories] = await Promise.all([
    getDocuments({ limit: 4, offset: 0 }),
    getConversations(5),
    getCategories()
  ]);

  return {
    documentCount: recentDocuments.length,
    categoryCount: categories.length,
    recentDocuments,
    recentConversations
  };
}
```

修改 `app/page.tsx`，把首页改成 `HomeAskPanel + KnowledgeSummaryGrid + RecentConversationList` 的组合。

- [ ] **Step 3：运行测试**

```bash
pnpm vitest run __tests__/app/home-page.test.tsx
```

- [ ] **Step 4：提交**

```bash
git add app/page.tsx lib/home/get-dashboard-summary.ts components/home/home-ask-panel.tsx components/home/knowledge-summary-grid.tsx components/home/recent-conversation-list.tsx __tests__/app/home-page.test.tsx
git commit -m "feat: redesign homepage as knowledge hub"
```

### Task 4：重做文档页与上传页

**Files:**
- Modify: `app/documents/page.tsx`
- Modify: `app/documents/upload/page.tsx`
- Modify: `components/documents/document-card.tsx`
- Modify: `components/documents/document-list.tsx`
- Modify: `components/documents/upload-zone.tsx`
- Create: `components/documents/document-filters.tsx`
- Create: `components/documents/upload-guide.tsx`
- Test: `__tests__/components/documents/document-library.test.tsx`

- [ ] **Step 1：写文档列表失败测试**

```tsx
import { render, screen } from '@testing-library/react';
import { DocumentList } from '@/components/documents/document-list';

describe('DocumentList', () => {
  it('渲染可提问文档卡片', () => {
    render(
      <DocumentList
        loading={false}
        documents={[
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
        ]}
      />
    );

    expect(screen.getByText('员工报销制度')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '去提问' })).toHaveAttribute('href', '/chat?doc=doc-1');
  });
});
```

- [ ] **Step 2：实现筛选条、文档卡片与上传说明区**

文档卡片关键结构：

```tsx
<Card className="p-5">
  <div className="flex items-start justify-between gap-4">
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">
        {document.file_type ?? 'FILE'}
      </p>
      <h3 className="text-xl font-medium text-[color:var(--ink)]">{document.title}</h3>
      <p className="text-sm text-[color:var(--muted)]">{document.file_name}</p>
    </div>
    <span className="rounded-full border border-[color:var(--border-soft)] px-3 py-1 text-xs text-[color:var(--muted)]">
      {statusLabels[document.status]}
    </span>
  </div>

  <div className="mt-6 flex gap-3">
    <Link href={`/chat?doc=${document.id}`}>
      <Button size="sm">去提问</Button>
    </Link>
    <Button variant="secondary" size="sm" onClick={handleDelete}>删除</Button>
  </div>
</Card>
```

上传说明区：

```tsx
export function UploadGuide() {
  return (
    <div className="rounded-[24px] border border-[color:var(--border-soft)] bg-white p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">导入说明</p>
      <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--muted)]">
        <li>支持 PDF、DOCX、MD、TXT，单文件最大 10MB。</li>
        <li>上传成功后系统会自动解析、切分并建立向量索引。</li>
        <li>处理完成后可直接跳转到问答页，在指定文档上下文中提问。</li>
      </ul>
    </div>
  );
}
```

- [ ] **Step 3：运行测试**

```bash
pnpm vitest run __tests__/components/documents/document-library.test.tsx
```

- [ ] **Step 4：提交**

```bash
git add app/documents/page.tsx app/documents/upload/page.tsx components/documents/document-card.tsx components/documents/document-list.tsx components/documents/upload-zone.tsx components/documents/document-filters.tsx components/documents/upload-guide.tsx __tests__/components/documents/document-library.test.tsx
git commit -m "feat: redesign documents and upload experience"
```

### Task 5：把分类页改造成知识地图

**Files:**
- Modify: `app/categories/page.tsx`
- Modify: `components/categories/category-tree.tsx`
- Create: `components/categories/category-map.tsx`
- Test: `__tests__/components/categories/category-map.test.tsx`

- [ ] **Step 1：写失败测试**

```tsx
import { render, screen } from '@testing-library/react';
import { CategoryMap } from '@/components/categories/category-map';

describe('CategoryMap', () => {
  it('渲染根分类和子分类', () => {
    render(
      <CategoryMap
        categories={[
          { id: 'cat-root', name: '制度', description: '公司制度库', parent_id: null, created_at: '2026-04-14' },
          { id: 'cat-child', name: '财务', description: '报销与预算', parent_id: 'cat-root', created_at: '2026-04-14' }
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />
    );

    expect(screen.getByText('制度')).toBeInTheDocument();
    expect(screen.getByText('财务')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新增分类' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2：实现 `CategoryMap`**

```tsx
'use client';

import { useState } from 'react';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

function buildTree(categories: Category[], parentId: string | null): Category[] {
  return categories.filter((category) => category.parent_id === parentId);
}

function CategoryNode({
  category,
  allCategories,
  depth,
  onEdit,
  onDelete,
  onAdd
}: {
  category: Category;
  allCategories: Category[];
  depth: number;
  onEdit: (id: string, name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (name: string, description: string, parentId?: string) => Promise<void>;
}) {
  const children = buildTree(allCategories, category.id);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editDesc, setEditDesc] = useState(category.description ?? '');

  return (
    <div className={depth > 0 ? 'ml-6 mt-3' : ''}>
      <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white p-5">
        {editing ? (
          <div className="space-y-3">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="分类名称" />
            <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="分类描述（可选）" />
            <div className="flex gap-2">
              <Button size="sm" onClick={async () => { await onEdit(category.id, editName, editDesc); setEditing(false); }}>保存</Button>
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>取消</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h3 className={depth === 0 ? 'text-2xl font-medium' : 'text-lg font-medium'}>{category.name}</h3>
                {category.description ? <p className="mt-1 text-sm text-[color:var(--muted)]">{category.description}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>编辑</Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(category.id)}>删除</Button>
              </div>
            </div>
            <div className="mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">添加子分类</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>添加子分类</DialogTitle></DialogHeader>
                  {/* 子分类表单，提交时调用 onAdd(name, desc, category.id) */}
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </div>
      {children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryMap({
  categories,
  onEdit,
  onDelete,
  onAdd
}: {
  categories: Category[];
  onEdit: (id: string, name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (name: string, description: string, parentId?: string) => Promise<void>;
}) {
  const roots = buildTree(categories, null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">Knowledge Taxonomy</p>
          <h2 className="mt-2 font-serif text-3xl">知识地图</h2>
        </div>
        <Button onClick={() => onAdd('新分类', '')}>新增根分类</Button>
      </div>
      <div className="space-y-4">
        {roots.map((root) => (
          <CategoryNode
            key={root.id}
            category={root}
            allCategories={categories}
            depth={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3：运行测试**

```bash
pnpm vitest run __tests__/components/categories/category-map.test.tsx
```

- [ ] **Step 4：提交**

```bash
git add app/categories/page.tsx components/categories/category-tree.tsx components/categories/category-map.tsx __tests__/components/categories/category-map.test.tsx
git commit -m "feat: redesign categories as knowledge map"
```

### Task 6：搭建新的聊天工作区骨架

**Files:**
- Modify: `app/chat/page.tsx`
- Modify: `app/chat/[id]/page.tsx`
- Modify: `components/chat/chat-container.tsx`
- Modify: `components/chat/chat-input.tsx`
- Modify: `components/chat/message-list.tsx`
- Modify: `components/chat/message-item.tsx`
- Create: `components/chat/chat-workspace.tsx`
- Create: `components/chat/conversation-sidebar.tsx`
- Create: `components/chat/chat-composer.tsx`
- Create: `hooks/use-conversation-list.ts`
- Test: `__tests__/components/chat/chat-workspace.test.tsx`

- [ ] **Step 1：写失败测试**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWorkspace } from '@/components/chat/chat-workspace';

global.fetch = vi.fn(async (input: RequestInfo | URL) => {
  if (String(input).startsWith('/api/conversations?')) {
    return new Response(JSON.stringify([{ id: 'conv-1', title: '报销流程', created_at: '2026-04-14T10:00:00.000Z' }]), { status: 200 });
  }
  return new Response(JSON.stringify([]), { status: 200 });
}) as typeof fetch;

describe('ChatWorkspace', () => {
  it('渲染会话侧栏和输入区', async () => {
    render(<ChatWorkspace initialConversationId={undefined} initialMessages={[]} initialTitle={null} />);

    expect(screen.getByText('最近会话')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入你想问的问题，Shift + Enter 换行')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('报销流程')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText('输入你想问的问题，Shift + Enter 换行'), '公司报销上限是多少？');
    expect(screen.getByRole('button', { name: '发送' })).toBeEnabled();
  });
});
```

- [ ] **Step 2：实现侧栏、composer 和 workspace**

**会话列表 hook（`hooks/use-conversation-list.ts`）：**

```ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '@/types/conversation';

export function useConversationList(limit = 20) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations?limit=${limit}`);
      if (!res.ok) throw new Error('获取会话列表失败');
      const data: Conversation[] = await res.json();
      setConversations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const deleteConversation = useCallback(async (id: string) => {
    const prev = conversations;
    setConversations((list) => list.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setConversations(prev);
        throw new Error('删除失败');
      }
    } catch (e) {
      setConversations(prev);
      throw e;
    }
  }, [conversations]);

  return { conversations, loading, error, refresh: fetchList, deleteConversation };
}
```

核心调用方式：

**会话侧栏组件（`components/chat/conversation-sidebar.tsx`）：**

```tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useConversationList } from '@/hooks/use-conversation-list';

export function ConversationSidebar({ activeId }: { activeId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { conversations, loading, deleteConversation } = useConversationList(20);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation(id);
      if (activeId === id) {
        router.push('/chat');
      }
    } catch (e) {
      // toast 错误提示
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="w-72 border-r border-[color:var(--border-soft)] bg-[color:var(--surface)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[color:var(--muted)]">最近会话</h2>
        <Link href="/chat"><Button size="sm">新建</Button></Link>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-[color:var(--border-soft)] animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conv) => (
            <li key={conv.id} className="group relative">
              <Link
                href={`/chat/${conv.id}`}
                className={`block p-3 rounded-lg transition-colors ${
                  activeId === conv.id
                    ? 'bg-[color:var(--surface-strong)] border border-[color:var(--border-strong)]'
                    : 'hover:bg-[color:var(--surface-strong)]'
                }`}
              >
                <p className="text-sm truncate">{conv.title ?? '未命名会话'}</p>
                <p className="text-xs text-[color:var(--muted)]">{formatDate(conv.created_at)}</p>
              </Link>
              {/* 删除按钮与确认弹层 */}
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[color:var(--muted)] hover:text-[color:var(--accent)]"
                    onClick={(e) => e.preventDefault()}
                  >
                    ×
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>确认删除会话</DialogTitle></DialogHeader>
                  <p className="text-sm text-[color:var(--muted)]">删除后将同时移除该会话的全部消息记录，无法恢复。</p>
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setDeletingId(null)}>取消</Button>
                    <Button variant="danger" onClick={() => handleDelete(conv.id)}>确认删除</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

**移动端会话抽屉（与桌面端侧栏共用同一组件，通过 viewport 判断切换布局）：**

```tsx
// 在 ChatWorkspace 中根据 viewport 判断
const isMobile = useMediaQuery('(max-width: 768px)');
const [sidebarOpen, setSidebarOpen] = useState(false);

// 桌面端：常驻左栏
// 移动端：从头部按钮触发抽屉
{isMobile ? (
  <>
    <button onClick={() => setSidebarOpen(true)} className="fixed top-4 left-4 z-50">
      会话列表
    </button>
    <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <DrawerContent>
        <ConversationSidebar activeId={conversationId} />
      </DrawerContent>
    </Drawer>
  </>
) : (
  <ConversationSidebar activeId={conversationId} />
)}
```
```

```tsx
const chat = useChat<KnowledgeUIMessage>({
  id: initialConversationId ?? 'new-conversation',
  messages: initialMessages,
  transport: new DefaultChatTransport({
    api: '/api/chat',
    prepareSendMessagesRequest: ({ messages }) => ({
      body: {
        message: messages[messages.length - 1],
        conversationId: initialConversationId,
        documentId
      }
    })
  })
});
```

- [ ] **Step 3：运行测试**

```bash
pnpm vitest run __tests__/components/chat/chat-workspace.test.tsx
```

- [ ] **Step 4：提交**

```bash
git add app/chat/page.tsx app/chat/[id]/page.tsx components/chat/chat-container.tsx components/chat/chat-input.tsx components/chat/message-list.tsx components/chat/message-item.tsx components/chat/chat-workspace.tsx components/chat/conversation-sidebar.tsx components/chat/chat-composer.tsx hooks/use-conversation-list.ts __tests__/components/chat/chat-workspace.test.tsx
git commit -m "feat: add redesigned chat workspace shell"
```

### Task 7：把 `/api/chat` 迁移到 AI SDK 流式响应

**Files:**
- Modify: `app/api/chat/route.ts`
- Modify: `lib/rag/retrieval.ts`
- Modify: `lib/supabase/chunks.ts`
- Modify: `lib/llm/glm.ts`
- Create: `lib/chat/glm-provider.ts`
- Create: `lib/chat/knowledge-prompt.ts`
- Test: `__tests__/app/api/chat/route.test.ts`

- [ ] **Step 1：写失败测试**

```ts
import { describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/chat/route';

vi.mock('@/lib/supabase/conversations', () => ({
  createConversation: vi.fn(async () => ({ id: 'conv-new', title: '报销问题', created_at: '2026-04-14T10:00:00.000Z' })),
  createMessage: vi.fn(async () => null),
  getMessages: vi.fn(async () => [])
}));

vi.mock('@/lib/chat/knowledge-prompt', () => ({
  prepareKnowledgeAnswer: vi.fn(async () => ({
    prompt: '根据知识库回答：报销政策',
    sources: [
      {
        document_id: 'doc-1',
        document_title: '员工手册',
        chunk_id: 'chunk-1',
        content: '报销流程说明'
      }
    ]
  }))
}));

describe('POST /api/chat', () => {
  it('先输出 conversation 和 sources，再合并文本流', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: {
            id: 'tmp-1',
            role: 'user',
            parts: [{ type: 'text', text: '公司的报销规则是什么？' }]
          }
        })
      }) as never
    );

    expect(response.status).toBe(200);
  });

  it('支持按 documentId 过滤检索范围', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: {
            id: 'tmp-2',
            role: 'user',
            parts: [{ type: 'text', text: '这篇文档讲了什么？' }]
          },
          documentId: 'doc-123'
        })
      }) as never
    );

    expect(response.status).toBe(200);
    // 验证 prepareKnowledgeAnswer 被调用时携带 documentId 参数
    expect(prepareKnowledgeAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ documentId: 'doc-123' })
    );
  });
});
```

- [ ] **Step 2：实现 provider 与路由**

创建 `lib/chat/glm-provider.ts`：

```ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const provider = createOpenAICompatible({
  name: 'glm',
  baseURL: process.env.GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.GLM_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || ''
});

export function glmModel(modelName = process.env.GLM_CHAT_MODEL || 'glm-5') {
  return provider.chatModel(modelName);
}
```

创建 `lib/chat/knowledge-prompt.ts`：

```ts
import type { Message } from '@/types/message';
import { retrieveRelevantChunks, chunksToSources } from '@/lib/rag/retrieval';
import { buildRAGPrompt, buildConversationPrompt } from '@/lib/llm/prompts';

interface PrepareOptions {
  question: string;
  history: Message[];
  documentId?: string;
}

export async function prepareKnowledgeAnswer(options: PrepareOptions) {
  const { question, history, documentId } = options;

  // 执行向量检索，支持按文档过滤
  const chunks = await retrieveRelevantChunks(question, { documentId, limit: 10 });
  const sources = chunksToSources(chunks);

  // 构建上下文文本
  const contextText = chunks.map((c) => `[${c.document_title ?? '未知文档'}]\n${c.content}`).join('\n\n');

  // 拼装历史对话
  const historyText = history
    .slice(-6) // 只取最近 6 条作为上下文
    .map((m) => `${m.role === 'user' ? '用户' : '助手'}：${m.content}`)
    .join('\n');

  // 组合 prompt
  const prompt = history.length > 0
    ? buildConversationPrompt(historyText, buildRAGPrompt(contextText, question))
    : buildRAGPrompt(contextText, question);

  return { prompt, sources };
}
```

修改 `lib/rag/retrieval.ts`，增加 `documentId` 过滤：

```ts
interface RetrieveOptions {
  limit?: number;
  threshold?: number;
  documentId?: string;  // 新增：可选的文档范围过滤
}

export async function retrieveRelevantChunks(
  question: string,
  options?: RetrieveOptions
): Promise<RetrievedChunk[]> {
  const { limit = 10, threshold = 0.1, documentId } = options ?? {};

  // 先获取问题向量
  const questionEmbedding = await getEmbedding(question);

  // 构建查询，按 documentId 过滤
  let query = supabase
    .rpc('match_chunks', {
      query_embedding: questionEmbedding,
      match_threshold: threshold,
      match_count: limit
    });

  if (documentId) {
    // 在 RPC 返回后做二次过滤，或在数据库函数中增加参数
    // 这里假设 match_chunks 支持 document_id 参数（需同步修改 SQL 函数）
    query = supabase.rpc('match_chunks_by_doc', {
      query_embedding: questionEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_document_id: documentId
    });
  }

  const { data, error } = await query;
  // ... 错误处理与返回
}
```

路由核心实现：

```ts
import { createUIMessageStream, createUIMessageStreamResponse, streamText } from 'ai';
import { getMessageText } from '@/lib/chat/message-parts';
import { glmModel } from '@/lib/chat/glm-provider';
import { prepareKnowledgeAnswer } from '@/lib/chat/knowledge-prompt';
import { createConversation, createMessage, getMessages } from '@/lib/supabase/conversations';
import type { ChatRequestBody } from '@/types/chat';

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequestBody;
  const question = getMessageText(body.message);

  if (!question.trim()) {
    return Response.json({ error: '请提供问题内容' }, { status: 400 });
  }

  let conversationId = body.conversationId;
  if (!conversationId) {
    const conversation = await createConversation({ title: question.slice(0, 50) });
    conversationId = conversation.id;
  }

  await createMessage({
    conversation_id: conversationId,
    role: 'user',
    content: question
  });

  const history = await getMessages(conversationId);
  const prepared = await prepareKnowledgeAnswer({
    question,
    history,
    documentId: body.documentId
  });

  const result = streamText({
    model: glmModel(),
    prompt: prepared.prompt
  });

  let fullAnswer = '';

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: 'data-conversation', data: { conversationId } });
        writer.write({ type: 'data-sources', data: prepared.sources });

        writer.merge(
          result.toUIMessageStream({
            onTextPart(part) {
              fullAnswer += part.text;
            },
            async onFinish() {
              await createMessage({
                conversation_id: conversationId!,
                role: 'assistant',
                content: fullAnswer,
                sources: prepared.sources
              });
            }
          })
        );
      }
    })
  });
}
```

- [ ] **Step 3：运行测试**

```bash
pnpm vitest run __tests__/app/api/chat/route.test.ts __tests__/lib/rag/retrieval.test.ts
```

- [ ] **Step 4：提交**

```bash
git add app/api/chat/route.ts lib/chat/glm-provider.ts lib/chat/knowledge-prompt.ts lib/rag/retrieval.ts lib/supabase/chunks.ts lib/llm/glm.ts __tests__/app/api/chat/route.test.ts
git commit -m "feat: migrate chat route to ai sdk streaming"
```

### Task 8：用 `streamdown` 渲染流式回答与来源区

**Files:**
- Modify: `components/chat/chat-workspace.tsx`
- Modify: `components/chat/message-list.tsx`
- Modify: `components/chat/message-item.tsx`
- Create: `components/chat/assistant-answer-card.tsx`
- Create: `components/chat/source-footnotes.tsx`
- Test: `__tests__/components/chat/assistant-answer-card.test.tsx`

- [ ] **Step 1：写失败测试**

```tsx
import { render, screen } from '@testing-library/react';
import { AssistantAnswerCard } from '@/components/chat/assistant-answer-card';
import type { KnowledgeUIMessage } from '@/types/chat';

describe('AssistantAnswerCard', () => {
  it('渲染 markdown 与来源引用', () => {
    const message: KnowledgeUIMessage = {
      id: 'm-1',
      role: 'assistant',
      metadata: { conversationId: 'conv-1' },
      parts: [
        { type: 'text', text: '## 报销规则\n- 需要审批' },
        {
          type: 'data-sources',
          data: [
            {
              document_id: 'doc-1',
              document_title: '员工手册',
              chunk_id: 'chunk-1',
              content: '审批流程说明'
            }
          ]
        }
      ]
    };

    render(<AssistantAnswerCard message={message} isStreaming={false} />);

    expect(screen.getByText('报销规则')).toBeInTheDocument();
    expect(screen.getByText('员工手册')).toBeInTheDocument();
    expect(screen.getByText('审批流程说明')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2：实现回答卡片与来源脚注**

**关于 `streamdown`：** 该库导出 `<Streamdown>` React 组件，支持 `parseIncompleteMarkdown` prop 来处理流式生成中未闭合的 markdown 结构。如果安装后发现 API 不同，需要根据实际导出调整。

来源脚注组件：

```tsx
import type { MessageSource } from '@/types/message';

export function SourceFootnotes({ sources }: { sources: MessageSource[] }) {
  if (!sources.length) return null;

  return (
    <div className="mt-6 border-t border-[color:var(--border-soft)] pt-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">参考来源</p>
      <div className="mt-3 space-y-3">
        {sources.map((source) => (
          <div key={source.chunk_id} className="rounded-2xl bg-[color:var(--surface)] p-4">
            <p className="text-sm font-medium text-[color:var(--ink)]">{source.document_title}</p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{source.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

回答卡片组件：

```tsx
import { Streamdown } from 'streamdown';
import { getAssistantSources, getMessageText } from '@/lib/chat/message-parts';
import type { KnowledgeUIMessage } from '@/types/chat';
import { SourceFootnotes } from '@/components/chat/source-footnotes';

export function AssistantAnswerCard({
  message,
  isStreaming
}: {
  message: KnowledgeUIMessage;
  isStreaming: boolean;
}) {
  const text = getMessageText(message);
  const sources = getAssistantSources(message);

  return (
    <article className="rounded-[28px] border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-6 shadow-[var(--shadow-card)]">
      <div className="prose prose-slate max-w-none">
        <Streamdown parseIncompleteMarkdown>{text}</Streamdown>
      </div>
      {isStreaming ? <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">生成中</p> : null}
      <SourceFootnotes sources={sources} />
    </article>
  );
}
```

> **注意：** 如果 `streamdown` 导出的不是 React 组件而是 hook 或函数，需要改用如下形式：
> ```tsx
> import { useStreamdown } from 'streamdown';
> // 或
> import { parseIncompleteMarkdown } from 'streamdown';
> const rendered = parseIncompleteMarkdown(text);
> // 然后用 ReactMarkdown 或 dangerouslySetInnerHTML 渲染
> ```
```

- [ ] **Step 3：运行测试**

```bash
pnpm vitest run __tests__/components/chat/assistant-answer-card.test.tsx __tests__/components/chat/chat-workspace.test.tsx __tests__/app/api/chat/route.test.ts
```

- [ ] **Step 4：提交**

```bash
git add components/chat/chat-workspace.tsx components/chat/message-list.tsx components/chat/message-item.tsx components/chat/assistant-answer-card.tsx components/chat/source-footnotes.tsx __tests__/components/chat/assistant-answer-card.test.tsx
git commit -m "feat: render streamed answers with streamdown"
```

### Task 9：全量验证与手动冒烟检查

**Files:**
- Modify: `docs/superpowers/plans/2026-04-14-knowledge-hub-redesign.md`
- Test: `__tests__/lib/chat/message-parts.test.ts`
- Test: `__tests__/components/layout/site-header.test.tsx`
- Test: `__tests__/app/home-page.test.tsx`
- Test: `__tests__/components/documents/document-library.test.tsx`
- Test: `__tests__/components/categories/category-map.test.tsx`
- Test: `__tests__/components/chat/chat-workspace.test.tsx`
- Test: `__tests__/components/chat/assistant-answer-card.test.tsx`
- Test: `__tests__/app/api/chat/route.test.ts`

- [ ] **Step 1：跑完整自动化检查**

```bash
pnpm test
pnpm lint
pnpm build
```

- [ ] **Step 2：本地手动冒烟**

```bash
pnpm dev
```

检查：

- 首页首屏是否优先展示提问入口，并且有知识摘要区
- `/documents` 是否能看到”去提问”入口，点击后 URL 是否携带 `?doc=<id>`
- `/documents/upload` 上传成功后是否有明确引导去问答
- `/categories` 是否呈现知识地图感，子分类能否正常显示与添加
- `/chat` 是否能创建新会话，并在完成后进入 `/chat/[id]`
- `/chat?doc=<id>` 是否能正确按文档范围检索并流式回答
- 聊天侧栏会话删除功能是否正常，删除当前会话后是否正确跳转到 `/chat`
- 移动端会话侧栏是否改为抽屉模式，桌面端是否保持常驻左栏

- [ ] **Step 3：修复问题后只重跑最小必要检查**

```bash
pnpm vitest run __tests__/components/chat/chat-workspace.test.tsx
pnpm vitest run __tests__/app/api/chat/route.test.ts
pnpm lint
pnpm build
```

- [ ] **Step 4：提交最终结果**

```bash
git add app components hooks lib package.json pnpm-lock.yaml vitest.config.ts vitest.setup.ts __tests__
git commit -m "feat: ship knowledge hub redesign"
```

---

## 覆盖检查

- 首页改版：Task 2, Task 3
- 文档页与上传页改版：Task 4
- 分类页改版：Task 5
- 聊天页骨架统一：Task 6
- Vercel AI SDK 接入：Task 7
- GLM OpenAI-compatible provider：Task 7
- `streamdown` 渲染：Task 8
- 错误处理与来源稳定展示：Task 7, Task 8
- 路由与构建验证：Task 9
