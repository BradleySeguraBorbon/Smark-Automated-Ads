import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.DEEPSEEK_OPENROUTER_API_KEY,

});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '"prompt" field is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-prover-v2:free',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const chatResponse = completion.choices[0].message?.content?.trim() || '';

    return NextResponse.json({ ok: true, response: chatResponse });
  } catch (error: any) {
    console.error('Error en la API:', {
      message: error.message,
      stack: error.stack,
      error: error,
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
