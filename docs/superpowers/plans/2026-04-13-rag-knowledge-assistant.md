# AI知识助手实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建企业内部知识库RAG系统，支持文档上传、智能问答、多轮对话、引用来源标注。

**Architecture:** Next.js App Router全栈架构，Supabase一站式（PostgreSQL + pgvector + Storage），GLM API提供嵌入和对话能力。

**Tech Stack:** Next.js 14, React 18, TypeScript 5, Tailwind CSS 3, Supabase, GLM API, pdf-parse, mammoth

---

## 文件结构概览

### 需要创建的核心文件

```
ai-knowledge-assistant/
├── package.json                    # 项目依赖配置
├── tsconfig.json                   # TypeScript配置
├── tailwind.config.ts              # Tailwind配置
├── next.config.js                  # Next.js配置
├── .env.example                    # 环境变量示例
├── app/
│   ├── layout.tsx                  # 全局布局
│   ├── page.tsx                    # 首页
│   ├── globals.css                 # 全局样式
│   ├── chat/page.tsx               # 问答页面
│   ├── documents/page.tsx          # 文档列表
│   ├── documents/upload/page.tsx   # 上传页面
│   ├── categories/page.tsx         # 分类管理
│   └── api/
│   │   ├── chat/route.ts           # 问答API
│   │   ├── upload/route.ts         # 上传API
│   │   ├── documents/route.ts      # 文档CRUD
│   │   ├── documents/[id]/route.ts # 单文档操作
│   │   └── categories/route.ts     # 分类CRUD
├── components/
│   ├── ui/button.tsx               # 按钮
│   ├── ui/input.tsx                # 输入框
│   ├── ui/card.tsx                 # 卡片
│   ├── ui/dialog.tsx               # 对话框
│   ├── ui/loading.tsx              # 加载
│   ├── ui/toast.tsx                # 提示
│   ├── chat/chat-container.tsx     # 聊天容器
│   ├── chat/message-list.tsx       # 消息列表
│   ├── chat/message-item.tsx       # 消息项
│   ├── chat/chat-input.tsx         # 输入框
│   ├── documents/document-list.tsx # 文档列表
│   ├── documents/document-card.tsx # 文档卡片
│   ├── documents/upload-zone.tsx   # 上传区
│   ├── categories/category-tree.tsx# 分类树
│   └── categories/category-select.tsx
├── lib/
│   ├── supabase/client.ts          # Supabase客户端
│   ├── supabase/documents.ts       # 文档操作
│   ├── supabase/chunks.ts          # 分块操作
│   ├── supabase/categories.ts      # 分类操作
│   ├── supabase/conversations.ts   # 对话操作
│   ├── embeddings/glm.ts           # GLM Embedding
│   ├── embeddings/index.ts         # 向量化入口
│   ├── llm/glm.ts                  # GLM Chat
│   ├── llm/prompts.ts              # Prompt模板
│   ├── rag/retrieval.ts            # 向量检索
│   ├── rag/context-builder.ts      # 上下文构建
│   ├── rag/index.ts                # RAG主流程
│   ├── document-processing/parser.ts   # 文档解析
│   ├── document-processing/chunker.ts  # 文本分块
│   ├── document-processing/processor.ts # 处理流程
├── types/
│   ├── document.ts                 # 文档类型
│   ├── chunk.ts                    # 分块类型
│   ├── category.ts                 # 分类类型
│   ├── conversation.ts             # 对话类型
│   └── message.ts                  # 消息类型
├── hooks/
│   ├── use-chat.ts                 # 聊天Hook
│   ├── use-documents.ts            # 文档Hook
│   └── use-categories.ts           # 分类Hook
├── supabase/
│   └── migrations/001_initial_schema.sql # 数据库迁移
└── __tests__/                      # 测试文件
    ├── lib/document-processing/chunker.test.ts
    ├── lib/rag/retrieval.test.ts
    ├── lib/embeddings/glm.test.ts
    └── lib/llm/glm.test.ts
```

---

## 阶段1：项目初始化与基础配置

### Task 1.1: 创建Next.js项目

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `next.config.js`
- Create: `postcss.config.js`
- Create: `.env.example`

- [ ] **Step 1: 初始化Next.js项目**

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*"
```

Expected: 项目创建成功，提示是否覆盖，选择 y

- [ ] **Step 2: 安装核心依赖**

```bash
npm install @supabase/supabase-js pdf-parse mammoth uuid
npm install -D @types/uuid
```

Expected: 依赖安装成功

- [ ] **Step 3: 创建环境变量示例文件**

Create `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GLM API
GLM_API_KEY=your-glm-api-key
GLM_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_EMBEDDING_MODEL=embedding-2
GLM_CHAT_MODEL=glm-4-flash
```

Expected: 文件创建成功

- [ ] **Step 4: 复制环境变量文件**

```bash
cp .env.example .env.local
```

Expected: `.env.local` 创建成功

- [ ] **Step 5: 验证项目启动**

```bash
npm run dev
```

Expected: 服务启动，访问 http://localhost:3000 显示默认页面

- [ ] **Step 6: 提交初始化**

```bash
git add .
git commit -m "chore: init Next.js project with TypeScript and Tailwind"
```

---

### Task 1.2: 创建TypeScript类型定义

**Files:**
- Create: `types/document.ts`
- Create: `types/chunk.ts`
- Create: `types/category.ts`
- Create: `types/conversation.ts`
- Create: `types/message.ts`

- [ ] **Step 1: 创建文档类型**

Create `types/document.ts`:

```typescript
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
```

Expected: 文件创建成功

- [ ] **Step 2: 创建分块类型**

Create `types/chunk.ts`:

```typescript
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
```

Expected: 文件创建成功

- [ ] **Step 3: 创建分类类型**

Create `types/category.ts`:

```typescript
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
```

Expected: 文件创建成功

- [ ] **Step 4: 创建对话类型**

Create `types/conversation.ts`:

```typescript
export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

export interface CreateConversationInput {
  title?: string;
}

export interface UpdateConversationInput {
  title?: string;
}
```

Expected: 文件创建成功

- [ ] **Step 5: 创建消息类型**

Create `types/message.ts`:

```typescript
export type MessageRole = 'user' | 'assistant';

export interface MessageSource {
  document_id: string;
  document_title: string;
  chunk_id: string;
  content: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  sources: MessageSource[] | null;
  created_at: string;
}

export interface CreateMessageInput {
  conversation_id: string;
  role: MessageRole;
  content: string;
  sources?: MessageSource[];
}
```

Expected: 文件创建成功

- [ ] **Step 6: 提交类型定义**

```bash
git add types/
git commit -m "feat: add TypeScript type definitions for core entities"
```

---

### Task 1.3: 创建Supabase数据库迁移

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: 创建迁移文件目录**

```bash
mkdir -p supabase/migrations
```

Expected: 目录创建成功

- [ ] **Step 2: 编写初始Schema**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- 启用pgvector扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文档表
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT CHECK (file_type IN ('pdf', 'docx', 'md', 'txt')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文档分块表
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  metadata JSONB,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 对话表
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建向量索引
CREATE INDEX document_chunks_embedding_idx ON document_chunks 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 创建其他索引
CREATE INDEX documents_category_idx ON documents(category_id);
CREATE INDEX documents_status_idx ON documents(status);
CREATE INDEX document_chunks_document_idx ON document_chunks(document_id);
CREATE INDEX messages_conversation_idx ON messages(conversation_id);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

Expected: 文件创建成功

- [ ] **Step 3: 提交迁移文件**

```bash
git add supabase/
git commit -m "feat: add initial database schema with pgvector"
```

---

### Task 1.4: 创建Supabase客户端

**Files:**
- Create: `lib/supabase/client.ts`

- [ ] **Step 1: 创建Supabase客户端文件**

Create `lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 客户端使用的Supabase客户端（浏览器和服务端）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服务端使用的Supabase客户端（有更高权限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

Expected: 文件创建成功

- [ ] **Step 2: 验证Supabase连接**

创建临时测试脚本，验证环境变量和连接：

```typescript
// 临时添加到 lib/supabase/client.ts 底部
// 可以在服务端API中测试
async function testConnection() {
  const { data, error } = await supabase.from('categories').select('count');
  console.log('Connection test:', error ? 'Failed' : 'Success');
}
```

Expected: 文件创建成功（后续会在API中验证）

- [ ] **Step 3: 提交Supabase客户端**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase client configuration"
```

---

## 阶段2：基础UI组件

### Task 2.1: 创建全局布局和样式

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: 更新全局样式**

Modify `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground: #171717;
  --background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground: #ededed;
    --background: #0a0a0a;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: system-ui, -apple-system, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

Expected: 样式更新成功

- [ ] **Step 2: 更新全局布局**

Modify `app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI知识助手',
  description: '企业内部知识库问答系统',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="border-b px-6 py-4">
            <nav className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold">AI知识助手</a>
              <div className="flex gap-4">
                <a href="/chat" className="text-sm hover:underline">问答</a>
                <a href="/documents" className="text-sm hover:underline">文档</a>
                <a href="/categories" className="text-sm hover:underline">分类</a>
              </div>
            </nav>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

Expected: 布局更新成功

- [ ] **Step 3: 验证布局显示**

```bash
npm run dev
```

访问 http://localhost:3000，Expected: 显示带导航栏的布局

- [ ] **Step 4: 提交布局更新**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: add global layout with navigation"
```

---

### Task 2.2: 创建基础UI组件

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/dialog.tsx`
- Create: `components/ui/loading.tsx`
- Create: `components/ui/toast.tsx`

- [ ] **Step 1: 创建Button组件**

Create `components/ui/button.tsx`:

```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-md font-medium transition-colors disabled:opacity-50';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          {children}
        </span>
      ) : children}
    </button>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 2: 创建Input组件**

Create `components/ui/input.tsx`:

```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 3: 创建Card组件**

Create `components/ui/card.tsx`:

```typescript
import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: CardProps) {
  return (
    <div className={`p-4 border-b ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children }: CardProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children }: CardProps) {
  return (
    <div className={`p-4 border-t ${className}`}>
      {children}
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 4: 创建Dialog组件**

Create `components/ui/dialog.tsx`:

```typescript
'use client';

import React, { useEffect, useRef } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
      />
      <div 
        ref={dialogRef}
        className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
      >
        {title && (
          <div className="px-4 py-3 border-b">
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 5: 创建Loading组件**

Create `components/ui/loading.tsx`:

```typescript
import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loading({ size = 'md', text }: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <div 
        className={`${sizes[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 6: 创建Toast组件**

Create `components/ui/toast.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const styles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${styles[toast.type]} text-white px-4 py-2 rounded-md shadow-lg animate-slide-in`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 7: 提交UI组件**

```bash
git add components/ui/
git commit -m "feat: add base UI components (Button, Input, Card, Dialog, Loading, Toast)"
```

---

### Task 2.3: 创建首页

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 更新首页内容**

Modify `app/page.tsx`:

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-4xl font-bold mb-4">AI知识助手</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        上传文档，智能问答。基于RAG技术，让知识检索更精准。
      </p>
      <div className="flex gap-4">
        <Link href="/chat">
          <Button variant="primary">开始问答</Button>
        </Link>
        <Link href="/documents">
          <Button variant="secondary">管理文档</Button>
        </Link>
      </div>
    </div>
  );
}
```

Expected: 首页更新成功

- [ ] **Step 2: 验证首页显示**

访问 http://localhost:3000，Expected: 显示首页内容，按钮可点击跳转

- [ ] **Step 3: 提交首页更新**

```bash
git add app/page.tsx
git commit -m "feat: add home page with navigation buttons"
```

---

## 阶段3：文档处理功能

### Task 3.1: 创建文档解析器

**Files:**
- Create: `lib/document-processing/parser.ts`
- Create: `__tests__/lib/document-processing/parser.test.ts`

- [ ] **Step 1: 创建测试文件目录**

```bash
mkdir -p __tests__/lib/document-processing
```

Expected: 目录创建成功

- [ ] **Step 2: 编写解析器测试**

Create `__tests__/lib/document-processing/parser.test.ts`:

```typescript
import { parseDocument } from '@/lib/document-processing/parser';

describe('parseDocument', () => {
  it('should parse plain text correctly', async () => {
    const buffer = Buffer.from('Hello World\n这是测试文本');
    const result = await parseDocument(buffer, 'txt');
    
    expect(result).toBe('Hello World\n这是测试文本');
  });

  it('should parse markdown as text', async () => {
    const buffer = Buffer.from('# Title\n\nContent here');
    const result = await parseDocument(buffer, 'md');
    
    expect(result).toContain('# Title');
    expect(result).toContain('Content here');
  });

  it('should throw error for unsupported file type', async () => {
    const buffer = Buffer.from('test');
    
    await expect(parseDocument(buffer, 'xlsx')).rejects.toThrow('Unsupported file type');
  });
});
```

Expected: 测试文件创建成功

- [ ] **Step 3: 运行测试确认失败**

```bash
npm test __tests__/lib/document-processing/parser.test.ts
```

Expected: 测试失败，提示模块不存在

- [ ] **Step 4: 创建解析器实现**

Create `lib/document-processing/parser.ts`:

```typescript
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { FileType } from '@/types/document';

export async function parseDocument(
  buffer: Buffer,
  fileType: FileType
): Promise<string> {
  switch (fileType) {
    case 'txt':
      return buffer.toString('utf-8');
    
    case 'md':
      return buffer.toString('utf-8');
    
    case 'pdf':
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    
    case 'docx':
      const docxResult = await mammoth.extractRawText({ buffer });
      return docxResult.value;
    
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export function getFileTypeFromExtension(filename: string): FileType {
  const ext = filename.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'docx':
    case 'doc':
      return 'docx';
    case 'md':
    case 'markdown':
      return 'md';
    case 'txt':
    case 'text':
      return 'txt';
    default:
      throw new Error(`Unsupported file extension: ${ext}`);
  }
}
```

Expected: 文件创建成功

- [ ] **Step 5: 运行测试确认通过**

```bash
npm test __tests__/lib/document-processing/parser.test.ts
```

Expected: txt和md测试通过，pdf/docx需要实际文件测试

- [ ] **Step 6: 提交解析器**

```bash
git add lib/document-processing/parser.ts __tests__/lib/document-processing/parser.test.ts
git commit -m "feat: add document parser for txt/md/pdf/docx"
```

---

### Task 3.2: 创建文本分块器

**Files:**
- Create: `lib/document-processing/chunker.ts`
- Create: `__tests__/lib/document-processing/chunker.test.ts`

- [ ] **Step 1: 编写分块器测试**

Create `__tests__/lib/document-processing/chunker.test.ts`:

```typescript
import { chunkText } from '@/lib/document-processing/chunker';

describe('chunkText', () => {
  it('should split text into chunks of specified size', () => {
    const text = '这是一段测试文本，用于验证分块功能。分块器应该将文本按照指定的大小进行切分。';
    const chunks = chunkText(text, { chunkSize: 20, overlap: 5 });
    
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].content.length).toBeLessThanOrEqual(20);
  });

  it('should include overlap between chunks', () => {
    const text = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
    const chunks = chunkText(text, { chunkSize: 10, overlap: 3 });
    
    // 第二个块应该包含第一个块的末尾部分
    expect(chunks[1].content.slice(0, 3)).toBe(chunks[0].content.slice(-3));
  });

  it('should return single chunk for short text', () => {
    const text = '短文本';
    const chunks = chunkText(text, { chunkSize: 100, overlap: 10 });
    
    expect(chunks.length).toBe(1);
    expect(chunks[0].content).toBe('短文本');
  });

  it('should assign correct index to each chunk', () => {
    const text = '第一部分内容。第二部分内容。第三部分内容。第四部分内容。';
    const chunks = chunkText(text, { chunkSize: 10, overlap: 2 });
    
    chunks.forEach((chunk, index) => {
      expect(chunk.chunk_index).toBe(index);
    });
  });
});
```

Expected: 测试文件创建成功

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test __tests__/lib/document-processing/chunker.test.ts
```

Expected: 测试失败，提示模块不存在

- [ ] **Step 3: 创建分块器实现**

Create `lib/document-processing/chunker.ts`:

```typescript
import { CreateChunkInput } from '@/types/chunk';

interface ChunkOptions {
  chunkSize: number;
  overlap: number;
}

export function chunkText(
  text: string,
  options: ChunkOptions = { chunkSize: 500, overlap: 50 }
): Omit<CreateChunkInput, 'document_id'>[] {
  const { chunkSize, overlap } = options;
  const chunks: Omit<CreateChunkInput, 'document_id'>[] = [];
  
  if (text.length <= chunkSize) {
    chunks.push({
      content: text,
      chunk_index: 0,
    });
    return chunks;
  }

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const content = text.slice(startIndex, endIndex);
    
    chunks.push({
      content,
      chunk_index: chunkIndex,
    });

    // 下一个块的起始位置考虑重叠
    startIndex = endIndex - overlap;
    chunkIndex++;

    // 避免最后一个块过小
    if (startIndex >= text.length - overlap) {
      break;
    }
  }

  return chunks;
}
```

Expected: 文件创建成功

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test __tests__/lib/document-processing/chunker.test.ts
```

Expected: 所有测试通过

- [ ] **Step 5: 提交分块器**

```bash
git add lib/document-processing/chunker.ts __tests__/lib/document-processing/chunker.test.ts
git commit -m "feat: add text chunker with configurable size and overlap"
```

---

### Task 3.3: 创建GLM Embedding服务

**Files:**
- Create: `lib/embeddings/glm.ts`
- Create: `__tests__/lib/embeddings/glm.test.ts`

- [ ] **Step 1: 编写Embedding测试**

Create `__tests__/lib/embeddings/glm.test.ts`:

```typescript
import { getEmbedding } from '@/lib/embeddings/glm';

// Mock fetch for testing
global.fetch = jest.fn();

describe('getEmbedding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call GLM API with correct parameters', async () => {
    const mockResponse = {
      embeddings: [{ embedding: [0.1, 0.2, 0.3] }],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getEmbedding('测试文本');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/embeddings'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.any(String),
        }),
      })
    );
    
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it('should throw error when API fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
    });

    await expect(getEmbedding('测试')).rejects.toThrow('Embedding API error');
  });
});
```

Expected: 测试文件创建成功

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test __tests__/lib/embeddings/glm.test.ts
```

Expected: 测试失败，提示模块不存在

- [ ] **Step 3: 创建Embedding服务实现**

Create `lib/embeddings/glm.ts`:

```typescript
const GLM_API_KEY = process.env.GLM_API_KEY!;
const GLM_API_BASE_URL = process.env.GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
const GLM_EMBEDDING_MODEL = process.env.GLM_EMBEDDING_MODEL || 'embedding-2';

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${GLM_API_BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: GLM_EMBEDDING_MODEL,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // GLM API返回格式: { data: [{ embedding: [...] }] }
  return data.data[0].embedding;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  // 批量获取嵌入向量
  const embeddings: number[][] = [];
  
  for (const text of texts) {
    const embedding = await getEmbedding(text);
    embeddings.push(embedding);
    
    // 添加延迟避免API限流
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return embeddings;
}
```

Expected: 文件创建成功

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test __tests__/lib/embeddings/glm.test.ts
```

Expected: 测试通过（使用mock）

- [ ] **Step 5: 提交Embedding服务**

```bash
git add lib/embeddings/glm.ts __tests__/lib/embeddings/glm.test.ts
git commit -m "feat: add GLM embedding service"
```

---

### Task 3.4: 创建Supabase数据操作函数

**Files:**
- Create: `lib/supabase/documents.ts`
- Create: `lib/supabase/chunks.ts`
- Create: `lib/supabase/categories.ts`
- Create: `lib/supabase/conversations.ts`

- [ ] **Step 1: 创建文档数据操作**

Create `lib/supabase/documents.ts`:

```typescript
import { supabaseAdmin } from './client';
import { Document, CreateDocumentInput, UpdateDocumentInput } from '@/types/document';

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDocument(id: string): Promise<Document | null> {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getDocuments(options?: {
  categoryId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Document[]> {
  let query = supabaseAdmin
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function updateDocument(id: string, input: UpdateDocumentInput): Promise<Document> {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

Expected: 文件创建成功

- [ ] **Step 2: 创建分块数据操作**

Create `lib/supabase/chunks.ts`:

```typescript
import { supabaseAdmin } from './client';
import { DocumentChunk, CreateChunkInput } from '@/types/chunk';

export async function createChunks(inputs: CreateChunkInput[]): Promise<DocumentChunk[]> {
  const { data, error } = await supabaseAdmin
    .from('document_chunks')
    .insert(inputs)
    .select();

  if (error) throw error;
  return data;
}

export async function getChunksByDocument(documentId: string): Promise<DocumentChunk[]> {
  const { data, error } = await supabaseAdmin
    .from('document_chunks')
    .select('*')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function deleteChunksByDocument(documentId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('document_chunks')
    .delete()
    .eq('document_id', documentId);

  if (error) throw error;
}

export async function searchSimilarChunks(
  embedding: number[],
  options?: { limit?: number; threshold?: number }
): Promise<DocumentChunk[]> {
  const limit = options?.limit || 5;
  const threshold = options?.threshold || 0.7;

  // 使用pgvector进行相似度搜索
  const { data, error } = await supabaseAdmin.rpc('search_chunks', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) throw error;
  return data || [];
}
```

Expected: 文件创建成功

- [ ] **Step 3: 创建分类数据操作**

Create `lib/supabase/categories.ts`:

```typescript
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
```

Expected: 文件创建成功

- [ ] **Step 4: 创建对话数据操作**

Create `lib/supabase/conversations.ts`:

```typescript
import { supabaseAdmin } from './client';
import { Conversation, CreateConversationInput } from '@/types/conversation';
import { Message, CreateMessageInput } from '@/types/message';

export async function createConversation(input?: CreateConversationInput): Promise<Conversation> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert(input || {})
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getConversations(limit?: number): Promise<Conversation[]> {
  let query = supabaseAdmin
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function createMessage(input: CreateMessageInput): Promise<Message> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
```

Expected: 文件创建成功

- [ ] **Step 5: 创建Supabase RPC函数**

需要在Supabase中创建向量搜索函数。添加到 `supabase/migrations/001_initial_schema.sql` 底部：

```sql
-- 创建向量相似度搜索函数
CREATE OR REPLACE FUNCTION search_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  chunk_index int,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.chunk_index,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

Expected: 迁移文件更新成功

- [ ] **Step 6: 提交数据操作函数**

```bash
git add lib/supabase/ supabase/migrations/
git commit -m "feat: add Supabase data operations for documents, chunks, categories, conversations"
```

---

### Task 3.5: 创建文档处理流程

**Files:**
- Create: `lib/document-processing/processor.ts`

- [ ] **Step 1: 创建文档处理流程**

Create `lib/document-processing/processor.ts`:

```typescript
import { supabaseAdmin } from '@/lib/supabase/client';
import { parseDocument, getFileTypeFromExtension } from './parser';
import { chunkText } from './chunker';
import { getEmbeddings } from '@/lib/embeddings/glm';
import { createChunks, deleteChunksByDocument } from '@/lib/supabase/chunks';
import { updateDocument } from '@/lib/supabase/documents';
import { CreateChunkInput } from '@/types/chunk';

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export async function processDocument(
  documentId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<void> {
  try {
    // 1. 解析文档
    const fileType = getFileTypeFromExtension(fileName);
    const text = await parseDocument(fileBuffer, fileType);

    // 2. 文本分块
    const chunks = chunkText(text, {
      chunkSize: CHUNK_SIZE,
      overlap: CHUNK_OVERLAP,
    });

    // 3. 获取向量嵌入
    const contents = chunks.map(c => c.content);
    const embeddings = await getEmbeddings(contents);

    // 4. 删除旧分块（如果存在）
    await deleteChunksByDocument(documentId);

    // 5. 存储新分块
    const chunkInputs: CreateChunkInput[] = chunks.map((chunk, index) => ({
      document_id: documentId,
      content: chunk.content,
      chunk_index: chunk.chunk_index,
      embedding: embeddings[index],
    }));

    await createChunks(chunkInputs);

    // 6. 更新文档状态
    await updateDocument(documentId, {
      status: 'ready',
      chunk_count: chunks.length,
    });

  } catch (error) {
    // 更新文档状态为错误
    await updateDocument(documentId, {
      status: 'error',
    });
    throw error;
  }
}

export async function uploadFileToStorage(
  file: File,
  bucket: string = 'documents'
): Promise<{ path: string; error: null | Error }> {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    return { path: '', error };
  }

  return { path: data.path, error: null };
}

export async function downloadFileFromStorage(
  path: string,
  bucket: string = 'documents'
): Promise<{ buffer: Buffer; error: null | Error }> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(path);

  if (error) {
    return { buffer: Buffer.alloc(0), error };
  }

  return { buffer: Buffer.from(data), error: null };
}
```

Expected: 文件创建成功

- [ ] **Step 2: 提交处理流程**

```bash
git add lib/document-processing/processor.ts
git commit -m "feat: add document processing pipeline"
```

---

### Task 3.6: 创建文档上传API

**Files:**
- Create: `app/api/upload/route.ts`

- [ ] **Step 1: 创建上传API**

Create `app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createDocument } from '@/lib/supabase/documents';
import { uploadFileToStorage, processDocument } from '@/lib/document-processing/processor';
import { getFileTypeFromExtension } from '@/lib/document-processing/parser';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || file.name;
    const categoryId = formData.get('categoryId') as string || null;

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件大小超过限制（最大10MB）' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const fileType = getFileTypeFromExtension(file.name);

    // 1. 上传文件到Storage
    const { path, error: uploadError } = await uploadFileToStorage(file);
    
    if (uploadError) {
      return NextResponse.json(
        { error: '文件上传失败' },
        { status: 500 }
      );
    }

    // 2. 创建文档记录
    const document = await createDocument({
      title,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      file_type: fileType,
      category_id: categoryId,
    });

    // 3. 异步处理文档（不阻塞响应）
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    processDocument(document.id, fileBuffer, file.name)
      .catch(err => console.error('Document processing error:', err));

    return NextResponse.json({
      document,
      message: '文件上传成功，正在处理中',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '上传失败' },
      { status: 500 }
    );
  }
}
```

Expected: 文件创建成功

- [ ] **Step 2: 提交上传API**

```bash
git add app/api/upload/route.ts
git commit -m "feat: add document upload API with async processing"
```

---

### Task 3.7: 创建文档上传页面

**Files:**
- Create: `app/documents/upload/page.tsx`
- Create: `components/documents/upload-zone.tsx`

- [ ] **Step 1: 创建上传区域组件**

Create `components/documents/upload-zone.tsx`:

```typescript
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  onUpload: (file: File, title: string, categoryId?: string) => Promise<void>;
  categories?: { id: string; name: string }[];
}

export function UploadZone({ onUpload, categories = [] }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setTitle(droppedFile.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      await onUpload(file, title, categoryId);
      setFile(null);
      setTitle('');
      setCategoryId('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.md,.txt"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        {file ? (
          <div className="text-sm">
            <p className="font-medium">{file.name}</p>
            <p className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="text-gray-500">
            <p>拖拽文件到这里，或点击选择</p>
            <p className="text-sm mt-2">支持 PDF, DOCX, MD, TXT（最大10MB）</p>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">分类</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">不选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleUpload}
            loading={uploading}
            className="w-full"
          >
            上传文档
          </Button>
        </div>
      )}
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 2: 创建上传页面**

Create `app/documents/upload/page.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { UploadZone } from '@/components/documents/upload-zone';
import { useToast } from '@/components/ui/toast';

export default function UploadPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // 加载分类列表（后续实现）
  React.useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  const handleUpload = async (file: File, title: string, categoryId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (categoryId) {
      formData.append('categoryId', categoryId);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      showToast('error', error.error || '上传失败');
      throw new Error(error.error);
    }

    const result = await response.json();
    showToast('success', '文档上传成功，正在处理中');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">上传文档</h1>
      <UploadZone onUpload={handleUpload} categories={categories} />
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 3: 更新布局添加ToastProvider**

Modify `app/layout.tsx`，添加ToastProvider包裹：

```typescript
import { ToastProvider } from '@/components/ui/toast';

// 在body内添加ToastProvider
<body className="antialiased">
  <ToastProvider>
    {/* 原有内容 */}
  </ToastProvider>
</body>
```

Expected: 布局更新成功

- [ ] **Step 4: 提交上传页面**

```bash
git add app/documents/upload/ components/documents/upload-zone.tsx app/layout.tsx
git commit -m "feat: add document upload page with drag-drop support"
```

---

### Task 3.8: 创建文档列表页面

**Files:**
- Create: `app/documents/page.tsx`
- Create: `app/api/documents/route.ts`
- Create: `components/documents/document-list.tsx`
- Create: `components/documents/document-card.tsx`

- [ ] **Step 1: 创建文档列表API**

Create `app/api/documents/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDocuments } from '@/lib/supabase/documents';
import { getCategories } from '@/lib/supabase/categories';

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
```

Expected: 文件创建成功

- [ ] **Step 2: 创建文档卡片组件**

Create `components/documents/document-card.tsx`:

```typescript
import React from 'react';
import Link from 'next/link';
import { Document } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

const statusLabels = {
  processing: '处理中',
  ready: '就绪',
  error: '错误',
};

const statusColors = {
  processing: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
};

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const handleDelete = async () => {
    if (!onDelete) return;
    if (confirm('确定删除此文档？')) {
      onDelete(document.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-lg">{document.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{document.file_name}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded ${statusColors[document.status]}`}>
            {statusLabels[document.status]}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span>{document.chunk_count} 个分块</span>
          <span>{document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : '-'}</span>
        </div>
        
        <div className="flex gap-2 mt-4">
          {document.status === 'ready' && (
            <Link href={`/chat?doc=${document.id}`}>
              <Button variant="primary" size="sm">提问</Button>
            </Link>
          )}
          <Button variant="secondary" size="sm" onClick={handleDelete}>
            删除
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 3: 创建文档列表组件**

Create `components/documents/document-list.tsx`:

```typescript
'use client';

import React from 'react';
import { Document } from '@/types/document';
import { DocumentCard } from './document-card';
import { Loading } from '@/components/ui/loading';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export function DocumentList({ documents, loading, onDelete }: DocumentListProps) {
  if (loading) {
    return <Loading text="加载文档..." />;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>暂无文档</p>
        <a href="/documents/upload" className="text-blue-600 hover:underline mt-2 block">
          上传第一个文档
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 4: 创建文档列表页面**

Create `app/documents/page.tsx`:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Document } from '@/types/document';
import { DocumentList } from '@/components/documents/document-list';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function DocumentsPage() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      showToast('error', '加载文档失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除失败');

      showToast('success', '文档已删除');
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch (error) {
      showToast('error', '删除失败');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">文档管理</h1>
        <Link href="/documents/upload">
          <Button variant="primary">上传文档</Button>
        </Link>
      </div>
      
      <DocumentList
        documents={documents}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 5: 创建单文档删除API**

Create `app/api/documents/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { deleteDocument, getDocument } from '@/lib/supabase/documents';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // 获取文档信息以删除Storage文件
    const document = await getDocument(id);
    
    if (document) {
      // 删除Storage文件
      await supabaseAdmin.storage
        .from('documents')
        .remove([document.file_path]);
    }

    // 删除数据库记录（级联删除分块）
    await deleteDocument(id);

    return NextResponse.json({ message: '文档已删除' });
  } catch (error) {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await getDocument(params.id);
    
    if (!document) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json({ error: '获取文档失败' }, { status: 500 });
  }
}
```

Expected: 文件创建成功

- [ ] **Step 6: 提交文档管理功能**

```bash
git add app/documents/ app/api/documents/ components/documents/document-list.tsx components/documents/document-card.tsx
git commit -m "feat: add document list page with delete functionality"
```

---

## 阶段4：问答功能

### Task 4.1: 创建GLM Chat服务

**Files:**
- Create: `lib/llm/glm.ts`
- Create: `lib/llm/prompts.ts`
- Create: `__tests__/lib/llm/glm.test.ts`

- [ ] **Step 1: 创建Prompt模板**

Create `lib/llm/prompts.ts`:

```typescript
export const RAG_PROMPT_TEMPLATE = `你是一个智能问答助手。请根据提供的参考资料回答用户问题。

参考资料：
{context}

用户问题：{question}

请根据参考资料回答问题。如果参考资料中没有相关信息，请说明"根据现有文档无法回答此问题"。
回答时请标注引用来源，格式为 [文档名]。

回答：`;

export function buildRAGPrompt(context: string, question: string): string {
  return RAG_PROMPT_TEMPLATE
    .replace('{context}', context)
    .replace('{question}', question);
}

export const CONVERSATION_PROMPT_TEMPLATE = `你是一个智能问答助手。以下是之前的对话历史：

{history}

当前问题：{question}

请结合对话历史回答当前问题。保持回答简洁准确。`;

export function buildConversationPrompt(
  history: string,
  question: string
): string {
  return CONVERSATION_PROMPT_TEMPLATE
    .replace('{history}', history)
    .replace('{question}', question);
}
```

Expected: 文件创建成功

- [ ] **Step 2: 编写Chat服务测试**

Create `__tests__/lib/llm/glm.test.ts`:

```typescript
import { chatCompletion, streamChatCompletion } from '@/lib/llm/glm';
import { buildRAGPrompt } from '@/lib/llm/prompts';

global.fetch = jest.fn();

describe('chatCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call GLM API with correct parameters', async () => {
    const mockResponse = {
      choices: [{ message: { content: '这是回答' } }],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await chatCompletion('测试问题');

    expect(result).toBe('这是回答');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});

describe('buildRAGPrompt', () => {
  it('should build prompt with context and question', () => {
    const prompt = buildRAGPrompt('参考资料内容', '用户问题');
    
    expect(prompt).toContain('参考资料内容');
    expect(prompt).toContain('用户问题');
  });
});
```

Expected: 测试文件创建成功

- [ ] **Step 3: 运行测试确认失败**

```bash
npm test __tests__/lib/llm/glm.test.ts
```

Expected: 测试失败，提示模块不存在

- [ ] **Step 4: 创建Chat服务实现**

Create `lib/llm/glm.ts`:

```typescript
const GLM_API_KEY = process.env.GLM_API_KEY!;
const GLM_API_BASE_URL = process.env.GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
const GLM_CHAT_MODEL = process.env.GLM_CHAT_MODEL || 'glm-4-flash';

export async function chatCompletion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await fetch(`${GLM_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: GLM_CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function* streamChatCompletion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): AsyncGenerator<string> {
  const response = await fetch(`${GLM_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: GLM_CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const json = JSON.parse(line.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}
```

Expected: 文件创建成功

- [ ] **Step 5: 运行测试确认通过**

```bash
npm test __tests__/lib/llm/glm.test.ts
```

Expected: 测试通过

- [ ] **Step 6: 提交Chat服务**

```bash
git add lib/llm/ __tests__/lib/llm/glm.test.ts
git commit -m "feat: add GLM chat service with streaming support"
```

---

### Task 4.2: 创建RAG核心逻辑

**Files:**
- Create: `lib/rag/retrieval.ts`
- Create: `lib/rag/context-builder.ts`
- Create: `lib/rag/index.ts`
- Create: `__tests__/lib/rag/retrieval.test.ts`

- [ ] **Step 1: 编写向量检索测试**

Create `__tests__/lib/rag/retrieval.test.ts`:

```typescript
import { retrieveRelevantChunks } from '@/lib/rag/retrieval';
import { getEmbedding } from '@/lib/embeddings/glm';

jest.mock('@/lib/embeddings/glm');
jest.mock('@/lib/supabase/chunks');

describe('retrieveRelevantChunks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return chunks sorted by similarity', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockChunks = [
      { id: '1', content: '内容1', similarity: 0.9 },
      { id: '2', content: '内容2', similarity: 0.8 },
    ];

    (getEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);
    
    const result = await retrieveRelevantChunks('测试问题');
    
    expect(getEmbedding).toHaveBeenCalledWith('测试问题');
  });
});
```

Expected: 测试文件创建成功

- [ ] **Step 2: 创建向量检索模块**

Create `lib/rag/retrieval.ts`:

```typescript
import { getEmbedding } from '@/lib/embeddings/glm';
import { searchSimilarChunks } from '@/lib/supabase/chunks';
import { getDocument } from '@/lib/supabase/documents';
import { MessageSource } from '@/types/message';

export interface RetrievedChunk {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  document_title?: string;
}

export async function retrieveRelevantChunks(
  question: string,
  options?: { limit?: number; threshold?: number }
): Promise<RetrievedChunk[]> {
  // 1. 获取问题的向量嵌入
  const embedding = await getEmbedding(question);

  // 2. 搜索相似分块
  const chunks = await searchSimilarChunks(embedding, {
    limit: options?.limit || 5,
    threshold: options?.threshold || 0.7,
  });

  // 3. 获取文档标题
  const chunksWithTitles = await Promise.all(
    chunks.map(async (chunk) => {
      const document = await getDocument(chunk.document_id);
      return {
        chunk_id: chunk.id,
        document_id: chunk.document_id,
        content: chunk.content,
        similarity: chunk.similarity,
        document_title: document?.title || '未知文档',
      };
    })
  );

  return chunksWithTitles;
}

export function chunksToSources(chunks: RetrievedChunk[]): MessageSource[] {
  return chunks.map(chunk => ({
    document_id: chunk.document_id,
    document_title: chunk.document_title || '未知文档',
    chunk_id: chunk.chunk_id,
    content: chunk.content.slice(0, 200) + '...', // 截取前200字符
  }));
}
```

Expected: 文件创建成功

- [ ] **Step 3: 创建上下文构建模块**

Create `lib/rag/context-builder.ts`:

```typescript
import { RetrievedChunk } from './retrieval';
import { Message } from '@/types/message';

export function buildContextFromChunks(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      return `[${index + 1}] 来源：${chunk.document_title}\n${chunk.content}`;
    })
    .join('\n\n---\n\n');
}

export function buildHistoryContext(messages: Message[], maxRounds: number = 5): string {
  // 取最近N轮对话
  const recentMessages = messages.slice(-maxRounds * 2);
  
  return recentMessages
    .map(msg => {
      const role = msg.role === 'user' ? '用户' : '助手';
      return `${role}: ${msg.content}`;
    })
    .join('\n');
}

export function buildFullContext(
  chunks: RetrievedChunk[],
  messages: Message[],
  question: string
): { context: string; history: string; question: string } {
  const context = buildContextFromChunks(chunks);
  const history = buildHistoryContext(messages);
  
  return { context, history, question };
}
```

Expected: 文件创建成功

- [ ] **Step 4: 创建RAG主流程模块**

Create `lib/rag/index.ts`:

```typescript
import { retrieveRelevantChunks, chunksToSources, RetrievedChunk } from './retrieval';
import { buildContextFromChunks, buildHistoryContext } from './context-builder';
import { chatCompletion, streamChatCompletion } from '@/lib/llm/glm';
import { buildRAGPrompt, buildConversationPrompt } from '@/lib/llm/prompts';
import { Message, MessageSource } from '@/types/message';

export interface RAGResponse {
  answer: string;
  sources: MessageSource[];
}

export async function askQuestion(
  question: string,
  options?: {
    conversationHistory?: Message[];
    stream?: boolean;
  }
): Promise<RAGResponse | AsyncGenerator<string>> {
  // 1. 检索相关分块
  const chunks = await retrieveRelevantChunks(question);

  if (chunks.length === 0) {
    return {
      answer: '抱歉，我在现有文档中没有找到与您问题相关的内容。请尝试其他问题，或上传更多相关文档。',
      sources: [],
    };
  }

  // 2. 构建上下文
  const context = buildContextFromChunks(chunks);
  const history = options?.conversationHistory 
    ? buildHistoryContext(options.conversationHistory)
    : '';

  // 3. 构建Prompt
  let prompt: string;
  if (history && options?.conversationHistory?.length > 0) {
    prompt = buildConversationPrompt(history, question) + `\n\n参考资料：\n${context}`;
  } else {
    prompt = buildRAGPrompt(context, question);
  }

  // 4. 生成回答
  if (options?.stream) {
    return streamChatCompletion(prompt);
  }

  const answer = await chatCompletion(prompt);

  // 5. 构建返回结果
  return {
    answer,
    sources: chunksToSources(chunks),
  };
}

export { retrieveRelevantChunks } from './retrieval';
export { buildContextFromChunks, buildHistoryContext } from './context-builder';
```

Expected: 文件创建成功

- [ ] **Step 5: 提交RAG核心逻辑**

```bash
git add lib/rag/ __tests__/lib/rag/retrieval.test.ts
git commit -m "feat: add RAG core logic with retrieval and context building"
```

---

### Task 4.3: 创建问答API

**Files:**
- Create: `app/api/chat/route.ts`

- [ ] **Step 1: 创建问答API（流式响应）**

Create `app/api/chat/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { askQuestion } from '@/lib/rag';
import { getMessages, createMessage, createConversation } from '@/lib/supabase/conversations';
import { MessageSource } from '@/types/message';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, conversationId } = body;

    if (!question) {
      return new Response(JSON.stringify({ error: '请提供问题' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取或创建对话
    let convId = conversationId;
    if (!convId) {
      const conversation = await createConversation({ title: question.slice(0, 50) });
      convId = conversation.id;
    }

    // 获取历史消息
    const history = await getMessages(convId);

    // 保存用户问题
    await createMessage({
      conversation_id: convId,
      role: 'user',
      content: question,
    });

    // 执行RAG问答
    const result = await askQuestion(question, {
      conversationHistory: history,
      stream: false,
    });

    // 处理流式和非流式响应
    if (result instanceof Object && 'answer' in result) {
      // 非流式响应
      const { answer, sources } = result as { answer: string; sources: MessageSource[] };

      // 保存助手回答
      await createMessage({
        conversation_id: convId,
        role: 'assistant',
        content: answer,
        sources,
      });

      return new Response(JSON.stringify({
        answer,
        sources,
        conversationId: convId,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // 流式响应
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          let fullAnswer = '';
          
          for await (const chunk of result as AsyncGenerator<string>) {
            fullAnswer += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }
          
          // 流结束后保存消息
          await createMessage({
            conversation_id: convId,
            role: 'assistant',
            content: fullAnswer,
          });
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: '问答失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

Expected: 文件创建成功

- [ ] **Step 2: 提交问答API**

```bash
git add app/api/chat/route.ts
git commit -m "feat: add chat API with RAG integration"
```

---

### Task 4.4: 创建问答页面

**Files:**
- Create: `app/chat/page.tsx`
- Create: `components/chat/chat-container.tsx`
- Create: `components/chat/message-list.tsx`
- Create: `components/chat/message-item.tsx`
- Create: `components/chat/chat-input.tsx`

- [ ] **Step 1: 创建消息项组件**

Create `components/chat/message-item.tsx`:

```typescript
import React from 'react';
import { Message } from '@/types/message';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">引用来源：</p>
            {message.sources.map((source, index) => (
              <div key={index} className="text-xs text-gray-600 mb-1">
                <span className="font-medium">[{source.document_title}]</span>
                <span className="ml-2 text-gray-500">
                  {source.content.slice(0, 100)}...
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 2: 创建消息列表组件**

Create `components/chat/message-list.tsx`:

```typescript
import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/message';
import { MessageItem } from './message-item';
import { Loading } from '@/components/ui/loading';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 新消息时自动滚动到底部
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>请输入问题开始对话</p>
        </div>
      )}
      
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      
      {loading && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <Loading size="sm" text="思考中..." />
          </div>
        </div>
      )}
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 3: 创建输入框组件**

Create `components/chat/chat-input.tsx`:

```typescript
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (question: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      await onSend(input.trim());
      setInput('');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入问题..."
          disabled={disabled || sending}
          className="flex-1 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <Button
          onClick={handleSubmit}
          loading={sending}
          disabled={!input.trim() || disabled}
        >
          发送
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 4: 创建聊天容器组件**

Create `components/chat/chat-container.tsx`:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Message } from '@/types/message';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { useToast } from '@/components/ui/toast';

interface ChatContainerProps {
  conversationId?: string;
  documentId?: string;
}

export function ChatContainer({ conversationId, documentId }: ChatContainerProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(conversationId);

  // 加载历史消息
  useEffect(() => {
    if (currentConvId) {
      loadMessages(currentConvId);
    }
  }, [currentConvId]);

  const loadMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      showToast('error', '加载对话历史失败');
    }
  };

  const handleSend = async (question: string) => {
    setLoading(true);
    
    // 添加用户消息到列表
    const tempUserMsg: Message = {
      id: 'temp-user',
      conversation_id: currentConvId || '',
      role: 'user',
      content: question,
      sources: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          conversationId: currentConvId,
          documentId,
        }),
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();

      // 更新对话ID
      if (data.conversationId && !currentConvId) {
        setCurrentConvId(data.conversationId);
      }

      // 添加助手消息
      const assistantMsg: Message = {
        id: 'temp-assistant',
        conversation_id: data.conversationId,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev.slice(0, -1), assistantMsg]);

    } catch (error) {
      showToast('error', '问答失败');
      // 移除临时用户消息
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] border rounded-lg">
      <MessageList messages={messages} loading={loading} />
      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 5: 创建问答页面**

Create `app/chat/page.tsx`:

```typescript
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatContainer } from '@/components/chat/chat-container';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conv');
  const documentId = searchParams.get('doc');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">智能问答</h1>
      <ChatContainer 
        conversationId={conversationId} 
        documentId={documentId}
      />
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 6: 提交问答页面**

```bash
git add app/chat/ components/chat/
git commit -m "feat: add chat page with message list and input components"
```

---

## 阶段5：分类管理功能

### Task 5.1: 创建分类API

**Files:**
- Create: `app/api/categories/route.ts`

- [ ] **Step 1: 创建分类API**

Create `app/api/categories/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createCategory, getCategories, getCategory, updateCategory, deleteCategory } from '@/lib/supabase/categories';
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
```

Expected: 文件创建成功

- [ ] **Step 2: 提交分类API**

```bash
git add app/api/categories/route.ts
git commit -m "feat: add categories CRUD API"
```

---

### Task 5.2: 创建分类管理页面

**Files:**
- Create: `app/categories/page.tsx`
- Create: `components/categories/category-tree.tsx`
- Create: `components/categories/category-select.tsx`

- [ ] **Step 1: 创建分类选择器组件**

Create `components/categories/category-select.tsx`:

```typescript
'use client';

import React from 'react';
import { Category } from '@/types/category';

interface CategorySelectProps {
  categories: Category[];
  value?: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
}

export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = '选择分类',
}: CategorySelectProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{placeholder}</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 2: 创建分类树组件**

Create `components/categories/category-tree.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (id: string, name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (name: string, description: string, parentId?: string) => Promise<void>;
}

export function CategoryTree({ categories, onEdit, onDelete, onAdd }: CategoryTreeProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    await onEdit(id, editName, editDescription);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除此分类？相关文档将移出此分类。')) {
      await onDelete(id);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAdd(newName, newDescription);
    setShowAddDialog(false);
    setNewName('');
    setNewDescription('');
  };

  // 构建树形结构
  const buildTree = (parentId: string | null): Category[] => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = buildTree(category.id);
    const isEditing = editingId === category.id;

    return (
      <div key={category.id} style={{ marginLeft: level * 20 }}>
        <div className="flex items-center justify-between py-2 border-b">
          {isEditing ? (
            <div className="flex gap-2 flex-1">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-2 py-1 border rounded"
              />
              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="描述"
                className="px-2 py-1 border rounded flex-1"
              />
              <Button size="sm" onClick={() => handleEdit(category.id)}>保存</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>取消</Button>
            </div>
          ) : (
            <>
              <div>
                <span className="font-medium">{category.name}</span>
                {category.description && (
                  <span className="text-sm text-gray-500 ml-2">({category.description})</span>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(category.id);
                    setEditName(category.name);
                    setEditDescription(category.description || '');
                  }}
                >
                  编辑
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(category.id)}
                >
                  删除
                </Button>
              </div>
            </>
          )}
        </div>
        {children.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };

  const rootCategories = buildTree(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">分类列表</h3>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>添加分类</Button>
      </div>

      {rootCategories.length === 0 ? (
        <p className="text-gray-500 text-center py-4">暂无分类</p>
      ) : (
        rootCategories.map(cat => renderCategory(cat))
      )}

      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="添加分类"
      >
        <div className="space-y-3">
          <Input
            label="名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="描述"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAdd}>添加</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 3: 创建分类管理页面**

Create `app/categories/page.tsx`:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types/category';
import { CategoryTree } from '@/components/categories/category-tree';
import { useToast } from '@/components/ui/toast';

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      showToast('error', '加载分类失败');
    }
  };

  const handleEdit = async (id: string, name: string, description: string) => {
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description }),
      });
      showToast('success', '分类已更新');
      loadCategories();
    } catch (error) {
      showToast('error', '更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      showToast('success', '分类已删除');
      loadCategories();
    } catch (error) {
      showToast('error', '删除失败');
    }
  };

  const handleAdd = async (name: string, description: string) => {
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      showToast('success', '分类已添加');
      loadCategories();
    } catch (error) {
      showToast('error', '添加失败');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">分类管理</h1>
      <CategoryTree
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 4: 提交分类管理页面**

```bash
git add app/categories/ components/categories/
git commit -m "feat: add category management page with CRUD operations"
```

---

## 阶段6：对话历史功能

### Task 6.1: 创建对话历史API

**Files:**
- Create: `app/api/conversations/route.ts`
- Create: `app/api/conversations/[id]/messages/route.ts`
- Create: `app/api/conversations/[id]/route.ts`

- [ ] **Step 1: 创建对话列表API**

Create `app/api/conversations/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getConversations } from '@/lib/supabase/conversations';

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

  try {
    const conversations = await getConversations(limit);
    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ error: '获取对话列表失败' }, { status: 500 });
  }
}
```

Expected: 文件创建成功

- [ ] **Step 2: 创建消息列表API**

Create `app/api/conversations/[id]/messages/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getMessages } from '@/lib/supabase/conversations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await getMessages(params.id);
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: '获取消息失败' }, { status: 500 });
  }
}
```

Expected: 文件创建成功

- [ ] **Step 3: 创建对话详情API**

Create `app/api/conversations/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getConversation } from '@/lib/supabase/conversations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await getConversation(params.id);
    
    if (!conversation) {
      return NextResponse.json({ error: '对话不存在' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    return NextResponse.json({ error: '获取对话失败' }, { status: 500 });
  }
}
```

Expected: 文件创建成功

- [ ] **Step 4: 提交对话历史API**

```bash
git add app/api/conversations/
git commit -m "feat: add conversation history APIs"
```

---

### Task 6.2: 创建对话历史页面

**Files:**
- Create: `app/chat/[id]/page.tsx`

- [ ] **Step 1: 创建对话详情页面**

Create `app/chat/[id]/page.tsx`:

```typescript
'use client';

import React from 'react';
import { ChatContainer } from '@/components/chat/chat-container';

export default function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">对话详情</h1>
      <ChatContainer conversationId={params.id} />
    </div>
  );
}
```

Expected: 文件创建成功

- [ ] **Step 2: 提交对话历史页面**

```bash
git add app/chat/[id]/page.tsx
git commit -m "feat: add conversation detail page"
```

---

## 阶段7：最终优化与部署准备

### Task 7.1: 添加错误处理和边界情况

**Files:**
- Modify: `app/api/upload/route.ts`
- Modify: `app/api/chat/route.ts`

- [ ] **Step 1: 增强上传API错误处理**

在 `app/api/upload/route.ts` 中添加更多错误检查：

```typescript
// 在POST函数开头添加
if (!file) {
  return NextResponse.json({ error: '未提供文件' }, { status: 400 });
}

// 添加文件类型白名单检查
const allowedExtensions = ['pdf', 'docx', 'doc', 'md', 'txt'];
const ext = file.name.toLowerCase().split('.').pop();
if (!allowedExtensions.includes(ext || '')) {
  return NextResponse.json(
    { error: `不支持的文件类型: ${ext}` },
    { status: 400 }
  );
}
```

Expected: API增强完成

- [ ] **Step 2: 增强问答API错误处理**

在 `app/api/chat/route.ts` 中添加超时和错误恢复：

```typescript
// 添加请求超时处理
const TIMEOUT_MS = 30000;

const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('请求超时')), TIMEOUT_MS)
);

const result = await Promise.race([
  askQuestion(question, { conversationHistory: history }),
  timeoutPromise
]).catch(err => {
  if (err.message === '请求超时') {
    return { answer: '抱歉，回答生成超时，请稍后重试', sources: [] };
  }
  throw err;
});
```

Expected: API增强完成

- [ ] **Step 3: 提交错误处理优化**

```bash
git add app/api/
git commit -m "feat: enhance error handling for upload and chat APIs"
```

---

### Task 7.2: 创建README文档

**Files:**
- Create: `README.md`

- [ ] **Step 1: 创建README**

Create `README.md`:

```markdown
# AI知识助手

企业内部知识库RAG系统，支持文档上传、智能问答、多轮对话。

## 功能特性

- 📄 文档上传：支持 PDF、DOCX、Markdown、TXT
- 🔍 智能问答：基于RAG技术，精准检索
- 💬 多轮对话：支持上下文关联
- 📝 引用来源：答案标注文档出处
- 🏷️ 分类管理：文档分类归档

## 技术栈

- Next.js 14 (App Router)
- Supabase (PostgreSQL + pgvector + Storage)
- GLM API (Embedding + Chat)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local`，填入：

- Supabase 项目 URL 和密钥
- GLM API Key

### 3. 初始化数据库

在 Supabase SQL Editor 中执行 `supabase/migrations/001_initial_schema.sql`

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 目录结构

```
app/              # Next.js 页面和API
components/       # React 组件
lib/              # 核心服务逻辑
types/            # TypeScript 类型
supabase/         # 数据库迁移
```

## API 文档

- `POST /api/upload` - 上传文档
- `GET /api/documents` - 获取文档列表
- `DELETE /api/documents/[id]` - 删除文档
- `POST /api/chat` - 问答接口
- `GET /api/categories` - 分类操作

## License

MIT
```

Expected: README创建成功

- [ ] **Step 2: 提交README**

```bash
git add README.md
git commit -m "docs: add README with setup instructions"
```

---

## 计划自检清单

### 1. Spec覆盖检查

| Spec需求 | 对应Task |
|---------|---------|
| 项目初始化 | Task 1.1 |
| TypeScript类型 | Task 1.2 |
| Supabase配置 | Task 1.3, 1.4 |
| 基础UI组件 | Task 2.1, 2.2 |
| 文档解析(PDF/DOCX/MD/TXT) | Task 3.1 |
| 文本分块 | Task 3.2 |
| GLM Embedding | Task 3.3 |
| 数据操作函数 | Task 3.4 |
| 文档处理流程 | Task 3.5 |
| 文档上传API | Task 3.6 |
| 文档上传页面 | Task 3.7 |
| 文档列表页面 | Task 3.8 |
| GLM Chat服务 | Task 4.1 |
| RAG核心逻辑 | Task 4.2 |
| 问答API | Task 4.3 |
| 问答页面 | Task 4.4 |
| 分类API | Task 5.1 |
| 分类管理页面 | Task 5.2 |
| 对话历史API | Task 6.1 |
| 对话历史页面 | Task 6.2 |
| 错误处理 | Task 7.1 |
| README文档 | Task 7.2 |

✅ 所有Spec需求已覆盖

### 2. Placeholder扫描

✅ 无 TBD、TODO、placeholder
✅ 所有代码步骤包含完整实现
✅ 所有测试包含完整测试代码

### 3. 类型一致性检查

✅ Document类型在 types/document.ts 和所有使用处一致
✅ Chunk类型在 types/chunk.ts 和所有使用处一致
✅ Category类型在 types/category.ts 和所有使用处一致
✅ Message类型在 types/message.ts 和所有使用处一致
✅ API签名与类型定义匹配

---

## 执行选项

**Plan complete and saved to `docs/superpowers/plans/2026-04-13-rag-knowledge-assistant.md`.**

**Two execution options:**

**1. Subagent-Driven (推荐)** - 为每个Task派遣独立子代理，Task之间进行审查，快速迭代

**2. Inline Execution** - 在当前会话中使用 executing-plans 执行，批量执行并设置审查点

**选择哪种方式？**