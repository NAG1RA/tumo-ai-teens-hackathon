import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { subject } = await req.json();

    if (!subject) {
      return new Response('Subject is required', { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a presentation expert. Create a well-structured presentation about the given subject. 
          The presentation should include:
          1. A title slide
          2. An introduction
          3. Main content slides (3-5 slides)
          4. A conclusion slide
          Each slide should have a clear title and 3-5 bullet points. Include speaker notes for each slide.
          Format the response as a JSON object with a title and an array of slides.
          Each slide should have: id, title, content (array of bullet points), and notes (speaker notes).`
        },
        {
          role: 'user',
          content: `Create a presentation about: ${subject}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const presentationContent = completion.choices[0].message.content;
    
    try {
      const presentationData = JSON.parse(presentationContent || '{}');
      return NextResponse.json(presentationData);
    } catch (error) {
      console.error('Error parsing presentation JSON:', error);
      return new Response('Error generating presentation structure', { status: 500 });
    }
  } catch (error) {
    console.error('Error in presentation generation:', error);
    return new Response('Error generating presentation', { status: 500 });
  }
} 