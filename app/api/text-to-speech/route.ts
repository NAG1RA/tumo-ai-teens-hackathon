import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Define the expected request body structure
interface GenerateSpeechRequest {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

export async function POST(req: Request) {
  try {
    // Extract the request body
    const body = await req.json() as GenerateSpeechRequest;
    
    if (!body.text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Initialize the OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call the OpenAI API
    const response = await client.audio.speech.create({
      model: 'tts-1',
      voice: body.voice ?? 'nova',
      input: body.text,
      response_format: 'mp3',
    });

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer();

    // Return the audio data with appropriate headers
    return new Response(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
