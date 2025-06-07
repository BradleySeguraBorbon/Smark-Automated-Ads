'use server';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import {generateText, streamText} from 'ai';
import { openai } from '@ai-sdk/openai';
import { parseJsonFromAiText } from '@/lib/ai/parseAiResponse';

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
    await client.connect(transport);

    const tools = await client.listTools();
    const toolSet = tools as unknown as import('ai').ToolSet;
    console.log('Tools available to AI:', toolSet);

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [{ role: 'user', content: prompt }],
      system: SYSTEM_PROMPT,
      tools: toolSet,
      maxTokens: 1000,
      temperature: 0.4,
    });
    console.log('AI response received:', result);
    const fullText = result.text;
    console.log('Full AI response:\n', fullText);

    const parsed = parseJsonFromAiText(fullText);

    console.log('Parsed AI response:\n', parsed);

    return JSON.parse(JSON.stringify(parsed));
  } catch (error: any) {
    console.error('AI stream or parsing error:', error);
    throw new Error(`AI response error:\n\n${error.message}`);
  } finally {
    client.close();
  }
}
