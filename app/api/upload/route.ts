import { NextRequest, NextResponse } from 'next/server';
import { createDocument } from '@/lib/supabase/documents';
import { uploadFileToStorage, processDocument } from '@/lib/document-processing/processor';
import { getFileTypeFromExtension } from '@/lib/document-processing/parser';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }

    const title = (formData.get('title') as string) || file.name;
    const categoryId = (formData.get('categoryId') as string) || null;

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件大小超过限制（最大10MB）' },
        { status: 400 }
      );
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