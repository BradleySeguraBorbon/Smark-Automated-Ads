import { MarketingCampaignFormData } from '@/types/MarketingCampaign';
import { IClient } from '@/types/Client';
import { IAdMessage } from '@/types/AdMessage';
import { ICampaignAudience } from '@/types/CampaignAudience';
import { IUser } from '@/types/User';

export function transformMarketingCampaignForSave(data: MarketingCampaignFormData) {
    return {
        ...data,
        tags: data.tags.map(tag => tag._id),
        users: data.users.map(user => user._id),
    };
}

export function transformClientForSave(data: IClient) {
    return {
        ...data,
        tags: data.tags.map(tag => tag._id),
        adInteractions: data.adInteractions.map(ad => ({ ...ad, adMessage: ad.adMessage._id })),
    };
}

export function transformAdMessageForSave(data: IAdMessage | any) {
    const base: any = {
        ...data,
        marketingCampaign: (data.marketingCampaign as any)._id || data.marketingCampaign,
        content: {},
    };

    let hasContent = false;

    if (data.type.includes('email') && data.content.email) {
        base.content.email = {
            ...data.content.email,
            template: typeof data.content.email.template === 'object'
                ? data.content.email.template._id
                : data.content.email.template,
        };
        hasContent = true;
    }

    if (data.type.includes('telegram') && data.content.telegram) {
        base.content.telegram = {
            ...data.content.telegram,
            template: typeof data.content.telegram.template === 'object'
                ? data.content.telegram.template._id
                : data.content.telegram.template,
        };
        hasContent = true;
    }

    if (!hasContent) {
        delete base.content;
    }

    return base;
}


export function transformCampaignAudienceForSave(data: ICampaignAudience) {
    return {
        ...data,
        campaign: data.campaign._id,
        audience: data.audience.map(client => client._id),
    };
}

export function transformUserForSave(data: IUser) {
    return {
        ...data,
        MarketingCampaigns: data.marketingCampaigns.map(campaign => campaign._id),
    };
}