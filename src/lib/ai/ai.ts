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
  - firstName: client's first name. For example: "clients named John" → filter by firstName: ["John"].
  - lastName: client's last name. For example: "clients with last name Smith" → filter by lastName: ["Smith"].
  - email: client's email address. Use it for direct matching when an email is mentioned.

  If the user mentions an age condition (e.g., "older than 60", "younger than 25", "clients over 40"), convert it into a birthDate range:
  - For "older than N", set 'max' to the ISO date of (today - N years).
  - For "younger than N", set 'min' to the ISO date of (today - N years).
  Always provide the computed 'min' or 'max' as a string in "YYYY-MM-DD" format.

  For "this month", compare the birthDate's month with the current month.

  If the user mentions people "without a value", like "clients without country", set match to "__MISSING__".

  If the user wants to maximize audience coverage or group clients by shared characteristics, use segmentAudience with an empty object: {}.

  If the user says 'detect market niches automatically', call segmentAudience with an empty object {}.

  Always call the 'segmentAudience' tool once per request. 
  If the user prompt implies multiple conditions, combine them in a single call by including all filters together inside the 'filters' array.

  Do not call the tool more than once. Only one invocation should be returned, containing all filters needed.

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

  If the prompt does not mention any criteria that can be mapped to the available filters, respond with a JSON object:
  {
    coverage: 0,
    totalClients: 0,
    selectedClients: [],
    segmentGroups: [],
    message: "Segmentation cannot be performed with given criteria"
  }
  Do not call the segmentAudience tool in this case.


  After calling the segmentAudience tool, you will receive a raw JSON response. You must rewrite the "reason" field in each segmentGroup to be short, clear, and user-friendly.

  For example:
  - "Named Carlos"
  - "Birthday this month"
  - "Prefers Telegram"
  - "Clients from Costa Rica"
  - "Spanish-speaking females"

  Then return the full JSON with the updated reasons exactly as required.
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
    throw new Error(`Segmentation could not be performed`);
  } finally {
    client.close();
  }
}