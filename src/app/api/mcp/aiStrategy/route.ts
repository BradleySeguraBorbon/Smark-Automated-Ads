import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getUserFromRequest } from '@/lib/auth';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.DEEPSEEK_OPENROUTER_API_KEY,
});

const MCP_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { prompt } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'El campo "prompt" es obligatorio' }, { status: 400 });
        }

        const systemPrompt = `Eres un asistente de campañas de marketing. Dado un mensaje en lenguaje natural,
debes generar una solicitud JSON que pueda enviarse a /api/mcp/strategy para segmentar clientes.

La estructura debe ser:
{
  "filters": [
    { "field": "firstName", "match": "Luis" },
    { "field": "birthDate", "currentMonth": true }
  ],
  "minGroupSize": 3,
  "maxCriteriaUsed": 3
}

Importante:
- Si el usuario quiere la mayor cobertura posible, genera un objeto vacío: {}
- Si menciona condiciones específicas, tradúcelas a filtros.
- Usa los campos permitidos: firstName, lastName, birthDate, preferences, tags, subscriptions, preferredContactMethod, telegramConfirmed
- Usa "currentMonth": true si habla del mes actual en birthDate.
- NO EXPLIQUES, devuelve solo el JSON sin texto adicional.`;

        const completion = await openai.chat.completions.create({
            model: 'deepseek/deepseek-prover-v2:free',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
        });

        const raw = completion.choices[0].message?.content?.trim() || '{}';

        let mcpRequest;
        try {
            const cleaned = raw
                .match(/```json\s*([\s\S]*?)```/)?.[1]
                ?.trim() || '{}';

            mcpRequest = JSON.parse(cleaned);
        } catch (e) {
            return NextResponse.json({
                error: 'Respuesta inválida del modelo. No se pudo parsear JSON.',
                rawResponse: raw
            }, { status: 400 });
        }

        const mcpRes = await fetch(`${MCP_BASE_URL}/api/mcp/strategy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-username': user.username,
                'x-user-role': user.role
            },
            body: JSON.stringify(mcpRequest)
        });

        const mcpData = await mcpRes.json();

        return NextResponse.json({
            ok: true,
            request: mcpRequest,
            response: mcpData
        });
    } catch (error: any) {
        console.error('Error en MCP-AI Strategy:', error.message || error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
