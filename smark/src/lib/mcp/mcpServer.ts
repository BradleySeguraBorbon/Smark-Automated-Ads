import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CustomSegmentRequest, generateCampaignStrategy } from "./mcp";

export const server = new McpServer({
    name: "Smark MCP",
    version: "1.0.0",
});

server.tool(
    "segmentAudience",
    "Segment clients by criteria like birthDate, gender, language, preferences, etc.",
    {
        filters: {
            type: "array",
            description: "Filters to apply for segmentation",
            items: {
                type: "object",
                properties: {
                    field: {
                        type: "string",
                        description: "Field to filter by"
                    },
                    match: {
                        type: "string",
                        description: "Value to match",
                        optional: true
                    },
                    currentMonth: {
                        type: "boolean",
                        description: "Filter by current month",
                        optional: true
                    },
                    min: {
                        type: "string",
                        description: "Minimum value for date range",
                        optional: true
                    },
                    max: {
                        type: "string",
                        description: "Maximum value for date range",
                        optional: true
                    }
                }
            }
        },
        minGroupSize: {
            type: "number",
            description: "Minimum group size",
            optional: true
        },
        maxCriteriaUsed: {
            type: "number",
            description: "Maximum criteria to use",
            optional: true
        }
    },
    async (args) => {
        try {
            const result = await generateCampaignStrategy(args as CustomSegmentRequest);
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        } catch (error) {
            throw new Error(`Error segmenting audience: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
);