import { NextRequest, NextResponse } from 'next/server';
import { scrapeLinkedInProfile, isValidLinkedInUrl } from '@/lib/scraper';
import { analyzeProfile } from '@/lib/analyzer';
import { AnalyzeRequest, AnalyzeResponse, ProfileData } from '@/types/analysis';

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((record.timestamp + RATE_LIMIT_WINDOW - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        error: `Muitas solicitações. Por favor, aguarde ${rateLimitResult.retryAfter} segundos antes de tentar novamente.`,
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfter || 60)
        }
      }
    );
  }

  try {
    const body: AnalyzeRequest = await request.json();
    const { url, profileText, parsedProfile, profilePhoto } = body;

    if (!url && !profileText && !parsedProfile) {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: 'Forneça uma URL do LinkedIn ou o texto do perfil.',
        },
        { status: 400 }
      );
    }

    let profileData: ProfileData;

    if (url && isValidLinkedInUrl(url)) {
      const scrapeResult = await scrapeLinkedInProfile(url);

      if (!scrapeResult.success) {
        if (scrapeResult.blocked) {
          return NextResponse.json<AnalyzeResponse>(
            {
              success: false,
              error: scrapeResult.error,
              requiresManualInput: true,
            },
            { status: 200 }
          );
        }
        return NextResponse.json<AnalyzeResponse>(
          {
            success: false,
            error: scrapeResult.error,
          },
          { status: 400 }
        );
      }

      profileData = scrapeResult.data!;
    } else if (parsedProfile) {
      profileData = parsedProfile as ProfileData;
    } else if (profileText) {
      const { parseManualProfileText } = await import('@/lib/parser');
      profileData = parseManualProfileText(profileText);
    } else {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: 'URL inválida ou perfil não fornecido.',
        },
        { status: 400 }
      );
    }

    const analysisResult = await analyzeProfile(profileData);

    analysisResult.profilePhoto = profilePhoto || null;

    return NextResponse.json<AnalyzeResponse>(
      {
        success: true,
        result: analysisResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    
    let errorMessage = 'Erro interno do servidor';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('rate_limit') || error.message.includes('429')) {
        errorMessage = 'OpenRouter está em rate limit. Por favor, aguarde alguns segundos e tente novamente.';
        statusCode = 429;
      } else if (error.message.includes('401') || error.message.includes('Invalid API Key')) {
        errorMessage = 'Chave da API OpenRouter inválida. Verifique a variável OPENROUTER_API_KEY.';
        statusCode = 401;
      } else if (error.message.includes('quota') || error.message.includes('credits')) {
        errorMessage = 'Créditos da API OpenRouter esgotados. Verifique seu plano e pagamentos.';
        statusCode = 402;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout na comunicação com a API. Tente novamente.';
        statusCode = 504;
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
