import {AdMessageContentEmail, AdMessageContentTelegram} from "@/types/AdMessage";
import {MarketingCampaignRef} from "@/types/MarketingCampaign";

export interface AdMessageFormData {
    _id?: string;
    name: string;
    marketingCampaign: MarketingCampaignRef;
    type: ('email' | 'telegram')[];
    sendDate: Date;
    status?: "sent" | "programmed" | "draft";
    attachments: { name: string; path: string }[];
    content: {
        email?: AdMessageContentEmail;
        telegram?: AdMessageContentTelegram;
    };
    createdAt?: Date;
    updatedAt?: Date;
}
