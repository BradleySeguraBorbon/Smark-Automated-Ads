import { NextResponse } from 'next/server'
import connectDB from '@/config/db'
import { getUserFromRequest } from '@/lib/auth'
import { AdMessages } from '@/models/models'

export async function GET(request: Request) {
    try {
        await connectDB();

        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const messages = await AdMessages.find({}, 'sendDate').lean();

        const filtered = messages
            .filter(m => m.sendDate)
            .map(m => ({ sendDate: m.sendDate }));

        return NextResponse.json(filtered);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching message dates' }, { status: 500 });
    }
}
