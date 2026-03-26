import { getText } from 'node-pdftotext';
import { ParsePreview } from '@/types/analysis';
import { parseLinkedInText, parsePreviewToProfileData } from './parser';

export interface PdfParseResult {
  text: string;
  pages: number;
  preview: ParsePreview;
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  const text: string = await getText(buffer, { 
    layout: true 
  });
  
  const cleanedText = text
    .replace(/\f/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  const lines = cleanedText.split('\n').filter(l => l.trim()).length;
  const pages = Math.max(1, Math.ceil(lines / 50));
  
  const preview = parseLinkedInText(cleanedText);
  
  return {
    text: cleanedText,
    pages,
    preview,
  };
}

export async function parsePdfToProfileData(buffer: Buffer) {
  const { preview } = await parsePdf(buffer);
  return parsePreviewToProfileData(preview);
}

export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 20 * 1024 * 1024;
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'PDF muito grande. Máximo 20MB.' };
  }
  
  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Arquivo não é um PDF válido.' };
  }
  
  return { valid: true };
}
