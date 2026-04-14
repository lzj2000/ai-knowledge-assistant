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