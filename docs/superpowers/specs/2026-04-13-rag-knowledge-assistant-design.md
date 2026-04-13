# AI知识助手 - 设计文档

## 项目概述

企业内部知识库RAG系统，支持文档上传、智能问答、多轮对话、引用来源标注。

### 核心需求

| 项目 | 选择 |
|------|------|
| 用途 | 企业内部知识库 |
| 用户规模 | 小团队（<10人） |
| 知识来源 | 文档文件（PDF、Word、Markdown、TXT等） |
| LLM | GLM模型 |
| 向量数据库 | Supabase pgvector |
| 前端框架 | Next.js App Router |
| 用户认证 | 不需要 |
| 问答功能 | 基础问答 + 引用来源 + 多轮对话 |
| 文档管理 | 上传、分类、删除、更新版本 |

---

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                   │
├─────────────────────────────────────────────────────────┤
│  前端层                                                  │
│  ├── /chat          问答对话页面                         │
│  ├── /documents     文档管理页面                         │
│  ├── /categories    分类管理页面                         │
│  └── /components    共享组件                             │
├─────────────────────────────────────────────────────────┤
│  API层 (App Router API Routes)                          │
│  ├── /api/chat      问答接口（流式响应）                  │
│  ├── /api/upload    文档上传接口                         │
│  └── /api/documents 文档CRUD接口                        │
├─────────────────────────────────────────────────────────┤
│  服务层 (lib/)                                           │
│  ├── rag.ts         RAG核心逻辑                          │
│  ├── embeddings.ts  向量化服务                           │
│  ├── document.ts    文档解析服务                         │
│  └── supabase.ts    数据库客户端                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase                              │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL + pgvector                                   │
│  ├── documents       文档元数据                          │
│  ├── categories      分类                               │
│  └── document_chunks 文档分块+向量                       │
├─────────────────────────────────────────────────────────┤
│  Storage                                                │
│  └── documents/      原始文件存储                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    GLM API                               │
├─────────────────────────────────────────────────────────┤
│  ├── Embedding API   文档向量化                         │
│  └── Chat API        问答生成                           │
└─────────────────────────────────────────────────────────┘
```

**架构特点：**
- 全栈Next.js，前后端一体化
- Supabase一站式：数据库、向量存储、文件存储
- GLM API统一：嵌入向量 + 对话生成

---

## 数据模型

### 表结构

```sql
-- 分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),  -- 支持嵌套分类
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文档表
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,           -- Supabase Storage路径
  file_size INTEGER,
  file_type TEXT,                     -- pdf/docx/md/txt
  category_id UUID REFERENCES categories(id),
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'processing',   -- processing/ready/error
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文档分块表（含向量）
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,       -- 分块顺序
  metadata JSONB,                     -- 页码、位置等额外信息
  embedding vector(1536),             -- GLM embedding维度
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 对话历史表（支持多轮对话）
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                 -- user/assistant
  content TEXT NOT NULL,
  sources JSONB,                       -- 引用的文档片段
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 向量索引（加速相似度搜索）
CREATE INDEX ON document_chunks 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### 表关系

| 表 | 用途 | 关联 |
|---|---|---|
| `categories` | 文档分类 | 自关联支持树形结构 |
| `documents` | 文档元数据 | 关联categories |
| `document_chunks` | 分块+向量 | 关联documents，级联删除 |
| `conversations` | 对话会话 | - |
| `messages` | 消息记录 | 关联conversations，级联删除 |

---

## 核心功能流程

### 文档上传与处理

```
用户上传文档
      │
      ▼
┌─────────────────┐
│ 1. 文件校验     │  检查格式、大小（限制10MB）
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 2. 存储文件     │  Supabase Storage
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 3. 创建记录     │  documents表，status=processing
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 4. 文档解析     │  PDF→文本、DOCX→文本等
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 5. 文本分块     │  按段落/固定大小切分（~500字）
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 6. 向量化       │  GLM Embedding API
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 7. 存储分块     │  document_chunks表
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 8. 更新状态     │  status=ready
└─────────────────┘
```

### 问答交互（RAG）

```
用户提问
      │
      ▼
┌─────────────────┐
│ 1. 问题向量化   │  GLM Embedding API
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 2. 向量检索     │  pgvector相似度搜索
│                 │  返回top-5相关分块
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 3. 构建上下文   │  分块内容 + 历史对话（最近5轮）
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 4. 生成答案     │  GLM Chat API（流式输出）
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 5. 标注来源     │  返回引用的文档/段落信息
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 6. 保存对话     │  messages表
└─────────────────┘
```

### 文档管理

| 操作 | 流程 |
|-----|------|
| **查看列表** | 按分类筛选、分页、状态过滤 |
| **分类归档** | 更新document.category_id |
| **删除文档** | 删除Storage文件 + 删除数据库记录（级联删除分块） |
| **更新版本** | 重新上传 → version+1 → 删除旧分块 → 重新处理 |

---

## 项目目录结构

```
ai-knowledge-assistant/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 全局布局
│   ├── page.tsx                  # 首页
│   ├── chat/
│   │   ├── page.tsx              # 问答对话页面
│   │   └── [id]/page.tsx         # 具体对话历史页面
│   ├── documents/
│   │   ├── page.tsx              # 文档列表页
│   │   └── upload/page.tsx       # 文档上传页
│   ├── categories/
│   │   └── page.tsx              # 分类管理页
│   └── api/
│   │   ├── chat/route.ts         # 问答API（流式）
│   │   ├── upload/route.ts       # 文档上传API
│   │   └── documents/
│   │   │   ├── route.ts          # 文档列表CRUD
│   │   │   └── [id]/route.ts     # 单个文档操作
│   │   └── categories/route.ts   # 分类CRUD
│
├── components/                   # 共享组件
│   ├── ui/                       # 基础UI组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   ├── chat/
│   │   ├── chat-container.tsx    # 聊天容器
│   │   ├── message-list.tsx      # 消息列表
│   │   ├── message-item.tsx      # 单条消息（含引用）
│   │   └── chat-input.tsx        # 输入框
│   ├── documents/
│   │   ├── document-list.tsx     # 文档列表
│   │   ├── document-card.tsx     # 文档卡片
│   │   └── upload-zone.tsx       # 上传区域
│   └── categories/
│   │   ├── category-tree.tsx     # 分类树
│   │   └── category-select.tsx   # 分类选择器
│
├── lib/                          # 核心服务层
│   ├── supabase/
│   │   ├── client.ts             # Supabase客户端
│   │   ├── documents.ts          # 文档数据操作
│   │   ├── chunks.ts             # 分块数据操作
│   │   ├── categories.ts         # 分类数据操作
│   │   └── conversations.ts      # 对话数据操作
│   ├── rag/
│   │   ├── index.ts              # RAG主流程
│   │   ├── retrieval.ts          # 向量检索
│   │   └── context-builder.ts    # 上下文构建
│   ├── embeddings/
│   │   ├── glm.ts                # GLM Embedding API
│   │   └── index.ts              # 向量化服务入口
│   ├── document-processing/
│   │   ├── parser.ts             # 文档解析（PDF/DOCX/MD/TXT）
│   │   ├── chunker.ts            # 文本分块策略
│   │   └── processor.ts          # 处理流程编排
│   └── llm/
│   │   ├── glm.ts                # GLM Chat API
│   │   └── prompts.ts            # Prompt模板
│
├── types/                        # TypeScript类型定义
│   ├── document.ts
│   ├── chunk.ts
│   ├── category.ts
│   ├── conversation.ts
│   └── message.ts
│
├── hooks/                        # React Hooks
│   ├── use-chat.ts               # 聊天状态管理
│   ├── use-documents.ts          # 文档列表
│   └── use-categories.ts         # 分类数据
│
├── styles/
│   └── globals.css               # 全局样式（Tailwind）
│
├── supabase/                     # Supabase配置
│   ├── migrations/               # 数据库迁移SQL
│   │   └ 001_initial_schema.sql
│   └── config.toml               # Supabase配置
│
├── .env.local                    # 环境变量
├── .env.example                  # 环境变量示例
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 技术选型细节

### 前端技术栈

| 技术 | 用途 | 版本 |
|-----|------|------|
| Next.js | 全栈框架 | 14.x (App Router) |
| React | UI框架 | 18.x |
| TypeScript | 类型安全 | 5.x |
| Tailwind CSS | 样式 | 3.x |

### 文档解析库

| 格式 | 解析库 |
|-----|------|
| PDF | pdf-parse |
| DOCX | mammoth |
| Markdown | 原生文本读取 |
| TXT | 原生文本读取 |

### 关键参数

| 参数 | 值 |
|-----|------|
| 单文件大小限制 | 10MB |
| 分块大小 | ~500字符 |
| 分块重叠 | 50字符 |
| 检索返回数量 | top-5 |
| 历史对话轮数 | 最近5轮 |

---

## 环境变量

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# GLM API
GLM_API_KEY=xxx
GLM_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_EMBEDDING_MODEL=embedding-2
GLM_CHAT_MODEL=glm-4-flash
```

---

## 里程碑规划

| 阶段 | 内容 | 优先级 |
|-----|------|------|
| **阶段1** | 项目初始化 + Supabase配置 + 基础UI | 高 |
| **阶段2** | 文档上传 + 解析 + 向量化 + 存储 | 高 |
| **阶段3** | 问答功能（基础问答+引用来源） | 高 |
| **阶段4** | 多轮对话 + 对话历史 | 中 |
| **阶段5** | 文档管理（分类、删除、版本更新） | 中 |
| **阶段6** | UI优化 + 错误处理 + 边缘情况 | 低 |