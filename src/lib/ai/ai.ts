'use server';

import { experimental_createMCPClient } from 'ai';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

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

Always respond by calling a tool with correct parameters. Do not explain or guess.
`.trim();

export async function runMcpAi({ prompt }: { prompt: string }) {
    const mcpClient = await experimental_createMCPClient({
        transport: {
            type: 'sse',
            url: `${process.env.NEXT_PUBLIC_MCP_URL}/sse`,
        },
        name: 'AutoSmark MCP Client',
    });

    const tools = await mcpClient.tools();

    const result = await streamText({
        model: openai('gpt-4o-mini'),
        messages: [{ role: 'user', content: prompt }],
        system: SYSTEM_PROMPT,
        tools,
        maxTokens: 1000,
        temperature: 0.4,
    });

    const response = result.toDataStreamResponse();

    return response;
}