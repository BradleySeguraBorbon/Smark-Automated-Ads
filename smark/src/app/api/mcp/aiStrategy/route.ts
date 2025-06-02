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

        const systemPrompt = `
You are a marketing campaign assistant. Given a prompt in natural language,
your task is to convert it into a valid JSON request for the /api/mcp/strategy endpoint.

The expected JSON structure is:
{
  "filters": [
    { "field": "firstName", "match": "Luis" },
    { "field": "birthDate", "currentMonth": true }
  ],
  "minGroupSize": 3,
  "maxCriteriaUsed": 3
}

Instructions:
- If the prompt is general or requests maximum coverage, return: {}
- If the prompt mentions specific characteristics, convert them to "filters".
- Accepted filter fields are:
  firstName, lastName, birthDate, preferences, tags, subscriptions, preferredContactMethod, telegramConfirmed,
  gender, country, languages

Advanced rules:
1. If age is mentioned (e.g., “between 20 and 30”, “older than 50”), convert it to a birthDate range using current date.
2. If generational groups are mentioned (e.g., “Gen Z”, “Millennials”), map them:
   - Gen Z: born 1997–2012
   - Millennials: born 1981–1996
   - Generation X: 1965–1980
   - Boomers: 1946–1964
3. If birth months are mentioned (e.g., “March to June”), convert to a birthDate range.
4. If "current month" or "this month" is mentioned, use { "field": "birthDate", "currentMonth": true }
5. If preferences are listed (e.g., “likes sports and travel”), use { field: "preferences", match: "sports" }, etc.
6. If country, gender, or language is mentioned, use the respective field with "match".

Response format:
- DO NOT add explanations or extra text.
- Always return only the valid JSON request, ideally inside triple backticks if needed.
`;


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
