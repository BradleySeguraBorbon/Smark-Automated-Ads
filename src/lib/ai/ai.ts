'use server';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { ToolSet } from 'ai';
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { parseJsonFromAiText } from '@/lib/ai/parseAiResponse';
import getTools from '@/lib/ai/aiTools';

const SYSTEM_PROMPT = `
  You are a segmentation assistant for marketing campaigns.

  Your goal is to segment clients using the segmentAudience tool.

  You can apply filters using the following fields:

  - birthDate: as ISO date (YYYY-MM-DD). You can filter by month, min/max ranges, or detect people older/younger than a specific age.
  - gender: one of 'male', 'female', 'non-binary', 'prefer_not_to_say'.
  - country: example values include 'Costa Rica', 'Mexico', 'Argentina', 'USA'. Consider regional groups like "Latin America" as: [Costa Rica, Mexico, Argentina, Colombia, etc.]. Consider "Europe" → [Spain, France, Germany, Italy, Netherlands, Sweden, Norway, …].
  - preferences: client's interests. Use it when users mention hobbies, themes, topics, or affinity.
  - languages: ISO language names like 'Spanish', 'English', 'Portuguese', etc.
  - subscriptions: active channels, e.g., 'email', 'telegram'.
  - preferredContactMethod: one of 'email', 'telegram'.
  - telegramConfirmed: boolean, true or false.
  - tags: assigned tags in the platform.

  If the user requests to target "young people", infer an age below 30 (use birthDate > 1995). For "older people", use age > 50 (birthDate < 1975). 
  For "this month", compare the birthDate's month with the current month.
  If the user mentions people "without a value", like "clients without country", set match to "__MISSING__".

  If the user wants to maximize audience coverage or group clients by shared characteristics, use segmentAudience with an empty object: {}.

  “If the user says 'detect market niches automatically', call segmentAudience with an empty object {}.”

  Always respond by calling the segmentAudience tool with proper filters. Do not explain or guess.
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
      maxSteps: 2,
      temperature: 0.4,
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