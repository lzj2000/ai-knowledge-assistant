# AI知识助手

企业内部知识库RAG系统，支持文档上传、智能问答、多轮对话。

## 功能特性

- 文档上传：支持 PDF、DOCX、Markdown、TXT
- 智能问答：基于RAG技术，精准检索
- 多轮对话：支持上下文关联
- 引用来源：答案标注文档出处
- 分类管理：文档分类归档

## 技术栈

- Next.js 14+ (App Router)
- Supabase (PostgreSQL + pgvector + Storage)
- GLM API (Embedding + Chat)

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local`，填入：

- Supabase 项目 URL 和密钥
- GLM API Key

### 3. 初始化数据库

在 Supabase SQL Editor 中执行 `supabase/migrations/001_initial_schema.sql`

### 4. 启动开发服务器

```bash
pnpm dev
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