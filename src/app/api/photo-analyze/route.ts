import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openaiClient';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo') as string | null;

    if (!photo) {
      return NextResponse.json(
        { success: false, error: 'Foto nao fornecida.' },
        { status: 400 }
      );
    }

    const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
    const byteSize = (base64Data.length * 3) / 4;

    if (byteSize > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Foto muito grande. Maximo 5MB.' },
        { status: 400 }
      );
    }

    const hasValidFormat = photo.startsWith('data:image/') &&
      ['jpeg', 'jpg', 'png', 'webp'].some(format => photo.startsWith(`data:image/${format}`));

    if (!hasValidFormat) {
      return NextResponse.json(
        { success: false, error: 'Formato invalido. Use JPEG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional headshot and portrait photography evaluator.
Analyze the provided profile photo and describe it in detail for a LinkedIn profile evaluation.

Focus ONLY on the profile photo (not any banner or background image). Describe:
1. Technical quality: resolution, lighting, sharpness, noise
2. Framing: how much of the frame the face occupies, centering, background cleanliness
3. Expression: smile, eye contact, approachability, professionalism
4. Overall professional appearance: attire (if visible), grooming, confidence conveyed
5. Background: clean/distracting, appropriate for professional context

Respond in Portuguese (Brazil). Be objective and specific.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Descreva esta foto de perfil do LinkedIn em detalhes para avaliacao profissional:',
            },
            {
              type: 'image_url',
              image_url: {
                url: photo,
                detail: 'low',
              },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 500,
    });

    const description = completion.choices[0]?.message?.content || '';

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Nao foi possivel analisar a foto.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photoResult: {
        hasPhoto: true,
        description,
        format: 'valid',
        size: byteSize,
      },
    });
  } catch (error: unknown) {
    console.error('Photo analysis error:', error);
    const message = error instanceof Error ? error.message : 'Erro ao analisar foto.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
