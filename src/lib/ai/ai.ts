'use server';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { parseAIResponse } from '@/lib/ai/parseAiResponse';

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

  await client.connect(transport);

  const tools = await client.listTools();

  const toolSet = tools as unknown as import('ai').ToolSet;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: [{ role: 'user', content: prompt }],
    system: SYSTEM_PROMPT,
    tools: toolSet,
    maxTokens: 1000,
    temperature: 0.4,
  });

  const response = result.toDataStreamResponse();
  if (!response.body) {
    throw new Error('No response body from data stream');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
  }

  const parsed = parseAIResponse(fullText);

  console.log('Parsed AI response:', parsed);

  client.close();
  return JSON.parse(JSON.stringify(parsed));
}
