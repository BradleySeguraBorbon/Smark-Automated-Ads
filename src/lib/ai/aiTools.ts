import { tool } from 'ai';
import { z } from 'zod';

export const segmentAudience = tool({
    description: 'Segment clients by criteria like birthDate, gender, language, preferences, etc.',
    parameters: z.object({
        filters: z.array(z.object({
            field: z.string(),
            match: z.array(z.string()).optional(),
            currentMonth: z.boolean().optional(),
            min: z.string().optional(),
            max: z.string().optional(),
        })).optional(),
        minGroupSize: z.number().optional(),
        maxCriteriaUsed: z.number().optional(),
    }),
    execute: async (args) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clients/segment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TOOL] Segment endpoint error:', errorText);
            throw new Error(`Segment endpoint failed with status ${response.status}`);
        }

        const json = await response.json();
        const text = json?.content?.[0]?.text ?? '';
        return JSON.parse(text);
    },
});

export default async function getTools() {
    return {
        segmentAudience,
    };
}
