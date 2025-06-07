'use server';

import { generateText, tool } from 'ai';
import { z } from 'zod';
import { parseJsonFromAiText } from '@/lib/ai/parseAiResponse';
import { openai } from '@ai-sdk/openai';

const SYSTEM_PROMPT = `
You are a segmentation assistant for marketing campaigns.

You can segment clients by using the segmentAudience tool.

Use it to group clients by fields like:
- birthDate (using match, currentMonth, min or max)
- gender
- country
- preferences
- languages
- subscriptions
- preferredContactMethod

If the user asks to maximize total audience coverage or to group clients by shared characteristics, call segmentAudience with an empty object {} (no filters) so the system can compute the optimal strategy automatically.

Always respond by calling a tool with correct parameters. Do not explain or guess.
`.trim();

const segmentAudienceTool = tool({
  description: 'Segment clients using audience criteria',
  parameters: z.object({
    filters: z.array(z.object({
      field: z.string(),
      match: z.string().optional(),
      currentMonth: z.boolean().optional(),
      min: z.string().optional(),
      max: z.string().optional(),
    })).optional(),
    minGroupSize: z.number().optional(),
    maxCriteriaUsed: z.number().optional(),
  }),
  execute: async (args) => {
    console.log('[TOOL] Executing segmentAudience with args:', args);

    const response = await fetch(`${process.env.NEXT_PUBLIC_MCP_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'segmentAudience',
        args,
      }),
    });

    const json = await response.json();

    console.log('[TOOL] Raw response from MCP:', json);

    const text = json?.content?.[0]?.text ?? '';

    console.log('[TOOL] Extracted text to return to model:', text);

    return JSON.parse(text);
  },
});

export async function runMcpAi({ prompt }: { prompt: string }) {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      system: SYSTEM_PROMPT,
      tools: {
        segmentAudience: segmentAudienceTool,
      },
      maxSteps: 2,
      temperature: 0.4,
      maxTokens: 1000,
    });

    console.log('[AI] Raw text from AI response:', text);

    const parsed = parseJsonFromAiText(text);

    console.log('[AI] Parsed JSON result:', parsed);

    return parsed;
  } catch (error: any) {
    console.error('AI response error:', error);
    throw new Error(`AI response error:\n\n${error.message}`);
  }
}
