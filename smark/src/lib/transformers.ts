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

export function transformAdMessageForSave(data: IAdMessage) {
    return {
        ...data,
        marketingCampaign: data.marketingCampaign._id,
        template: data.template ? data.template._id : null,
    };
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