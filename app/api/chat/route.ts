import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, prompt, stream: shouldStream = true } = body;
    
    // Handle both chat messages and direct prompts
    const apiMessages = messages ? messages : [
      {
        role: 'system',
        content: 'You are a friendly and helpful AI study partner. You provide clear, constructive feedback and suggestions in a casual, encouraging tone.',
      },
      {
        role: 'user',
        content: prompt || '',
      }
    ];
    
    if (!messages && !prompt) {
      return new Response('Either messages or prompt is required', { status: 400 });
    }
    
    // For non-streaming responses (topic generation or feedback)
    if (!shouldStream) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: apiMessages,
          temperature: 0.7,
          stream: false,
        });
        
        return new Response(response.choices[0].message.content, {
          headers: { 'Content-Type': 'text/plain' },
        });
      } catch (error) {
        console.error('OpenAI API error:', error);
        return new Response('Error communicating with OpenAI API', { status: 500 });
      }
    }
    
    // For streaming responses (default)
    const streamingResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: apiMessages,
      temperature: 0.7,
      stream: true,
    });
    
    // Create a ReadableStream from the OpenAI stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        for await (const chunk of streamingResponse) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        
        controller.close();
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('An error occurred while processing your request', { status: 500 });
  }
}
