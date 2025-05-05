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
      return NextResponse.json({ error: 'El campo "prompt" es obligatorio' }, { status: 400 });
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

    console.log("Completion: ",completion);

    const chatResponse = completion.choices[0].message?.content?.trim() || '';

    console.log("Respuesta de Chat",chatResponse);

    return NextResponse.json({ ok: true, response: chatResponse });
  } catch (error: any) {
    console.error('Error en la API:', error.message || error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
