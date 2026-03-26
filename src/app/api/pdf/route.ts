import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInText } from '@/lib/parser';
import { parsePreviewToProfileData } from '@/lib/parser';

interface PdfAnalyzeRequest {
  text: string;
  photo?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PdfAnalyzeRequest = await request.json();
    const { text, photo } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Texto do PDF não fornecido.' },
        { status: 400 }
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        { error: 'Texto extraído muito curto. Verifique se o PDF contém texto selecionável.' },
        { status: 400 }
      );
    }

    const preview = parseLinkedInText(text);
    const profileData = parsePreviewToProfileData(preview);

    return NextResponse.json({
      success: true,
      preview,
      profileData,
      profilePhoto: photo || null,
      warnings: preview.warnings.length > 0 ? preview.warnings : undefined,
    });
  } catch (error) {
    console.error('PDF text processing error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar texto. Tente novamente.' },
      { status: 500 }
    );
  }
}
