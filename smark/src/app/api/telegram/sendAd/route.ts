import { NextResponse } from 'next/server';
import { AdMessages, CampaignAudiences } from '@/models/models';
import { sendMultipleTelegram } from '../route';
import connectDB from '@/config/db';

export async function POST(req: Request) {
    try {
        await connectDB();

        const { adMessageId } = await req.json();

        if (!adMessageId) {
            return NextResponse.json({ error: 'adMessageId is required' }, { status: 400 });
        }

        const adMessage = await AdMessages.findById(adMessageId);

        if (!adMessage) {
            return NextResponse.json({ error: 'AdMessage not found' }, { status: 404 });
        }

        const marketingCampaignId = adMessage.marketingCampaign;

        const campaignAudience = await CampaignAudiences.findOne({ marketingCampaign: marketingCampaignId })
        .populate({
            path: 'audience',
            select: 'telegramChatId'
        });

        if (!campaignAudience || !campaignAudience.audience || campaignAudience.audience.length === 0) {
            return NextResponse.json({ error: 'No audience found for this campaign' }, { status: 404 });
        }

        const chatIds = campaignAudience.audience
            .filter((client: any) => client.telegramChatId)
            .map((client: any) => client.telegramChatId);

        if (chatIds.length === 0) {
            return NextResponse.json({ error: 'No valid Telegram ChatIds found in audience' }, { status: 404 });
        }

        const messageText = adMessage.content.telegram.message;

        await sendMultipleTelegram(chatIds, messageText);

        return NextResponse.json({ success: 'Messages sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error sending Ads:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
