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

If the user requests to target "young people", infer an age below 30 (use birthDate > [current date - 30 years]).
If the user requests "older people", infer an age above 50 (use birthDate < [current date - 50 years]).

If the user specifies an exact age, convert it to a birthDate range. 
- Example: "25 years old" → birthDate between [today - 26 years] and [today - 25 years]
- "between 30 and 40 years" → birthDate between [today - 40 years] and [today - 30 years]

To compute birthDate from age, subtract the number of years from today's date. Always use ISO format (YYYY-MM-DD).

For "this month", compare the birthDate's month with the current month (use currentMonth: true).

If the user mentions people "without a value", like "clients without country", set match to "__MISSING__".

If the user wants to maximize audience coverage or group clients by shared characteristics, use segmentAudience with an empty object: {}.

If the user says "detect market niches automatically", call segmentAudience with an empty object {}.

Always respond by calling a tool with correct parameters. Do not explain or guess.

Always provide filter.match as an array of strings, even when there is only one value.

Always return JSON in the exact format required by the application. Do not explain your reasoning. Never return Markdown or lists. Return only a single valid JSON object matching this structure:
{
  coverage: number,
  totalClients: number,
  selectedClients: string[],
  segmentGroups: { 
    criterion: string,
    value: string,
    clientIds: string[],
    reason: string 
  }[]
}
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
      maxTokens: 4096,
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