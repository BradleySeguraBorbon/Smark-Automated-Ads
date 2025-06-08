'use server';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { ToolSet } from 'ai';
import {generateText, streamText} from 'ai';
import { openai } from '@ai-sdk/openai';
import { parseJsonFromAiText } from '@/lib/ai/parseAiResponse';
import getTools from '@/lib/ai/aiTools';

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

export async function runMcpAi({ prompt }: { prompt: string }) {
  const transport = new SSEClientTransport(
    new URL(`${process.env.NEXT_PUBLIC_MCP_URL}/sse`)
  );
  console.log(`[MCP] SSE URL: ${process.env.NEXT_PUBLIC_MCP_URL}/sse`);

  const client = new Client(
    {
      name: 'AutoSmark MCP Client',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {},
      },
    }
  );

  try {
    console.log('[MCP] Connecting to transport...');
    await client.connect(transport);
    console.log('[MCP] Connected to MCP server');

    const tools = await getTools();
    console.log('[MCP] Tools available to AI:', tools);

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [{ role: 'user', content: prompt }],
      system: SYSTEM_PROMPT,
      tools: tools,
      maxTokens: 1000,
      temperature: 0.4,
      maxSteps: 2,
    });
    console.log('[AI] Full response text:', JSON.stringify(text));

    const parsed = parseJsonFromAiText(text);

    console.log('[AI] Parsed response:', parsed);

    return JSON.parse(JSON.stringify(parsed));
  } catch (error: any) {
    console.error('AI stream or parsing error:', error);
    throw new Error(`AI response error:\n\n${error.message}`);
  } finally {
    client.close();
  }
}