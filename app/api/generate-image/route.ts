import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';
import { NextResponse } from 'next/server';

// Allow responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const { image } = await generateImage({
      model: openai.image('dall-e-3'),
      prompt,
      size: '1024x1024',
      providerOptions: {
        openai: { style: 'vivid', quality: 'standard' },
      },
    });

    // Return the image data in a structured format
    return NextResponse.json({ 
      imageUrl: `data:image/png;base64,${image.base64}` 
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ 
      error: 'Failed to generate image' 
    }, { 
      status: 500 
    });
  }
}
