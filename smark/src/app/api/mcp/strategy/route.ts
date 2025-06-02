import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { generateCampaignStrategy } from '@/lib/mcp/engine';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const strategy = await generateCampaignStrategy({
            filters: body.filters,
            maxCriteriaUsed: Math.min(Math.max(1, body.maxCriteriaUsed || 5), 5),
            minGroupSize: Math.max(3, body.minGroupSize || 3)
        });

        return NextResponse.json({
            message: strategy.message || 'Campaign audience strategy generated successfully.',
            strategy
        }, { status: 200 });

    } catch (err) {
        console.error('Error generating MCP strategy:', err);
        return NextResponse.json({ error: 'Error generating campaign strategy' }, { status: 500 });
    }
}
