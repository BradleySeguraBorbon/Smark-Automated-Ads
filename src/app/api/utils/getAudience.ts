import { AdMessages, CampaignAudiences } from '@/models/models';
import connectDB from '@/config/db';
import {decryptClient} from "@/lib/clientEncryption";

export async function getAudience(adMessageId: string, field: 'email' | 'telegram.chatId') {
    await connectDB();

    const adMessage = await AdMessages.findById(adMessageId);
    if (!adMessage) throw new Error('AdMessage not found');

    const campaignAudience = await CampaignAudiences.findOne({
        campaign: adMessage.marketingCampaign,
    }).populate({ path: 'audience', select: field });

    if (!campaignAudience || !campaignAudience.audience || campaignAudience.audience.length === 0)
        throw new Error('No audience found for this campaign');

    const decryptedAudience = campaignAudience.audience.map((client: any) => decryptClient(client));
    
    let contacts: string[] = [];
    if (field === 'email') {
        contacts = decryptedAudience
            .filter((client: any) => client.email)
            .map((client: any) => client.email);
    } else if (field === 'telegram.chatId') {
        contacts = decryptedAudience
            .filter((client: any) => client.telegram?.chatId)
            .map((client: any) => client.telegram.chatId);
    }

    return { adMessage, contacts };
}
