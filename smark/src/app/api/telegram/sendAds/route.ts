import { NextRequest, NextResponse } from 'next/server';
import { getAudience } from '@/app/api/utils/getAudience';
import { sendTelegramMessages } from '../route';
import { AdMessages } from '@/models/models';

export async function POST(req: NextRequest) {
    try {
        const { adMessageId } = await req.json();
        const { adMessage, contacts } = await getAudience(adMessageId, 'telegramChatId');

        await sendTelegramMessages(contacts, adMessage.content.telegram.message || '');

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error(err);
        if (adMessageId) {
            await AdMessages.findByIdAndUpdate(adMessageId, { status: 'draft' });
        }
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
