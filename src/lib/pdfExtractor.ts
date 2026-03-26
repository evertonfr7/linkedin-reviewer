export interface PdfExtractResult {
  text: string;
  pages: number;
}

export async function extractTextFromPdf(file: File): Promise<PdfExtractResult> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  const pdf = await pdfjsLib.getDocument({
    data: uint8Array,
  }).promise;
  
  const pages: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const pageText = (textContent.items as Array<{ str?: string }>)
      .filter((item) => item.str)
      .map((item) => item.str as string)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    pages.push(pageText);
  }
  
  const fullText = pages.join('\n\n');
  
  return {
    text: fullText,
    pages: pdf.numPages,
  };
}

export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 20 * 1024 * 1024;
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'PDF muito grande. Máximo 20MB.' };
  }
  
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Arquivo não é um PDF válido.' };
  }
  
  return { valid: true };
}
