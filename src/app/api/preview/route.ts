import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInText, parsePreviewToProfileData } from '@/lib/parser';
import { AnalyzePreviewResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileText } = body;

    if (!profileText || typeof profileText !== 'string') {
      return NextResponse.json<AnalyzePreviewResponse>(
        {
          success: false,
          error: 'Texto do perfil não fornecido.',
        },
        { status: 400 }
      );
    }

    if (profileText.trim().length < 20) {
      return NextResponse.json<AnalyzePreviewResponse>(
        {
          success: false,
          error: 'Texto muito curto. Forneça pelo menos o nome e algumas informações do perfil.',
        },
        { status: 400 }
      );
    }

    const preview = parseLinkedInText(profileText);

    return NextResponse.json<AnalyzePreviewResponse>(
      {
        success: true,
        preview,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Preview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    
    return NextResponse.json<AnalyzePreviewResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
