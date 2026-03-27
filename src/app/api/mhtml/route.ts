import { NextRequest, NextResponse } from 'next/server';
import { parseMhtml, parsePreviewToProfileData } from '@/lib/mhtmlParser';

const ALLOWED_MIME_TYPES = ['multipart/related', 'message/rfc822'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Tipo de conteúdo inválido. Use multipart/form-data.' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const uploadedFile = formData.get('file') as File | null;
    const photo = formData.get('photo') as string | null;

    if (!uploadedFile) {
      return NextResponse.json(
        { success: false, error: 'Arquivo MHTML não fornecido.' },
        { status: 400 }
      );
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Arquivo muito grande. Máximo 20MB.' },
        { status: 400 }
      );
    }

    const fileName = uploadedFile.name.toLowerCase();
    if (!fileName.endsWith('.mhtml') && !fileName.endsWith('.mht') &&
        !fileName.endsWith('.html') && !fileName.endsWith('.htm')) {
      return NextResponse.json(
        { success: false, error: 'Arquivo deve ser MHTML, MHT ou HTML.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await uploadedFile.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const mhtmlContent = decoder.decode(arrayBuffer);

    const preview = parseMhtml(mhtmlContent);
    const profileData = parsePreviewToProfileData(preview);

    return NextResponse.json({
      success: true,
      preview,
      profileData,
      profilePhoto: photo || null,
      warnings: preview.warnings.length > 0 ? preview.warnings : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao processar MHTML.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
