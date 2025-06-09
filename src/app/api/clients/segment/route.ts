import { generateCampaignStrategy } from '@/lib/mcp/mcp';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/config/db";
import SegmentedAudience from "@/models/SegmentedAudience";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[SEGMENT] Strategy request:', JSON.stringify(body, null, 2));
    const result = await generateCampaignStrategy(body);

    console.log('[SEGMENT] Strategy result:', result);

    await connectDB();
    const saved = await SegmentedAudience.create({
      coverage: result.coverage,
      totalClients: result.totalClients,
      selectedClients: result.selectedClients,
      segmentGroups: result.segmentGroups,
    });
    console.log("[AI] Segment saved:", saved);
    return NextResponse.json({
      content: [
        {
          type: 'text',
          text: JSON.stringify({ segmentId: String(saved._id) }),
        },
      ],
    });
  } catch (err: any) {
    console.error('[API] Segment error:', err);
    return NextResponse.json(
      {
        content: [
          {
            type: 'text',
            text: `Error segmenting audience: ${err.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      },
      { status: 500 }
    );
  }
}
