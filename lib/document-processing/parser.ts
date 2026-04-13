import { PDFParse } from 'pdf-parse';
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
      const pdfParser = new PDFParse({ data: buffer });
      const pdfTextResult = await pdfParser.getText();
      return pdfTextResult.text;

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