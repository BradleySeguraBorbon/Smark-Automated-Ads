import { NextRequest, NextResponse } from 'next/server';
import { getAudience } from '@/app/api/utils/getAudience';
import { sendTelegramMessages } from '@/lib/utils/telegramSender';
import { AdMessages } from '@/models/models';

export async function POST(req: NextRequest) {

    const { adMessageId } = await req.json();
    try {
        const { adMessage, contacts } = await getAudience(adMessageId, 'telegram.chatId');
console.log("Contacts:", contacts);
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
