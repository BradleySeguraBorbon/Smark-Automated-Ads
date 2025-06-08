import { createMcpHandler } from '@vercel/mcp-adapter';
import { generateCampaignStrategy } from '@/lib/mcp/mcp';

const handler = createMcpHandler(
    async (server) => {
        server.tool(
            'segmentAudience',
            'Segment clients by criteria like birthDate, gender, language, preferences, etc.',
            {
                filters: {
                    type: 'array',
                    optional: true,
                    description: 'List of filters to apply',
                    items: {
                        type: 'object',
                        properties: {
                            field: {
                                type: 'string',
                                description: 'Field to filter by',
                            },
                            match: {
                                type: 'string',
                                optional: true,
                            },
                            currentMonth: {
                                type: 'boolean',
                                optional: true,
                            },
                            min: {
                                type: 'string',
                                optional: true,
                            },
                            max: {
                                type: 'string',
                                optional: true,
                            },
                        },
                    },
                },
                minGroupSize: {
                    type: 'number',
                    optional: true,
                    description: 'Minimum group size to include a segment',
                },
                maxCriteriaUsed: {
                    type: 'number',
                    optional: true,
                    description: 'Maximum number of criteria to apply',
                },
            },
            async (params) => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clients/segment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(params),
                    });

                    if (!response.ok) throw new Error(`Status ${response.status}: ${await response.text()}`);
                    const json = await response.json();
                    return json;
                } catch (err: any) {
                    return {
                        content: [{ type: 'text', text: `Error segmenting audience: ${err.message || 'Unknown error'}` }],
                        isError: true,
                    };
                }
            }
        );
    },
    {
        capabilities: {
            tools: {
                segmentAudience: {
                    description: 'Segment clients using audience criteria',
                },
            },
        },
    },
    {
        redisUrl: process.env.REDIS_URL,
        basePath: '',
        verboseLogs: true,
        maxDuration: 60,
    }
);

export { handler as GET, handler as POST, handler as DELETE };
