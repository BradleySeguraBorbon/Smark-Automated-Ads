import { NextRequest, NextResponse } from 'next/server';
import { getAudience } from '@/app/api/utils/getAudience';
import { sendTelegramMessages } from '../route';

export async function POST(req: NextRequest) {
    try {
        const { adMessageId } = await req.json();
        const { adMessage, contacts } = await getAudience(adMessageId, 'telegramChatId');

        await sendTelegramMessages(contacts, adMessage.content.telegram.message || '');

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
