import { generateCampaignStrategy } from '@/lib/mcp/mcp';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateCampaignStrategy(body);

    console.log('[SEGMENT] Strategy result:', result);
    return NextResponse.json({
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
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
