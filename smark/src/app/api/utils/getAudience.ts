import { AdMessages, CampaignAudiences } from '@/models/models';
import connectDB from '@/config/db';

export async function getAudience(adMessageId: string, field: 'email' | 'telegramChatId') {
    await connectDB();

    const adMessage = await AdMessages.findById(adMessageId);
    if (!adMessage) throw new Error('AdMessage not found');

    const campaignAudience = await CampaignAudiences.findOne({
        marketingCampaign: adMessage.marketingCampaign,
    }).populate({ path: 'audience', select: field });

    if (!campaignAudience || !campaignAudience.audience || campaignAudience.audience.length === 0)
        throw new Error('No audience found for this campaign');

    const contacts = campaignAudience.audience
        .filter((client: any) => client[field])
        .map((client: any) => client[field]);

    return { adMessage, contacts };
}
