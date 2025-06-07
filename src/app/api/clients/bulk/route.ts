import { NextRequest, NextResponse } from 'next/server';
import { Clients } from '@/models/models';
import connectToDB from '@/config/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await connectToDB();

        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty IDs array' }, { status: 400 });
        }

        const clients = await Clients.find({
            _id: { $in: ids }
        })
            .select('_id firstName lastName email preferredContactMethod telegram.chatId tags subscriptions')
            .limit(10)
            .lean();

        return NextResponse.json({ results: clients }, { status: 200 });
    } catch (err: any) {
        console.error('Error in bulk client fetch:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
