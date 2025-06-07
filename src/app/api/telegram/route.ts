import { NextRequest, NextResponse } from 'next/server';
import { sendToTelegram } from '@/lib/utils/telegramSender';

export async function POST(req: NextRequest) {
    const { chatIds, message } = await req.json();

    if (!chatIds || !Array.isArray(chatIds) || !message) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    try {
        await Promise.all(chatIds.map(id => sendToTelegram(id, message)));
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to send messages' }, { status: 500 });
    }
}
