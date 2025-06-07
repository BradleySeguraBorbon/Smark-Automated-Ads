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
                    const result = await generateCampaignStrategy(params);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    };
                } catch (err: any) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error segmenting audience: ${err.message || 'Unknown error'}`,
                            },
                        ],
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
