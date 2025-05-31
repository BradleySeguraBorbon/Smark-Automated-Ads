import {AdMessageContentEmail, AdMessageContentTelegram} from "@/types/AdMessage";

export interface AdMessageFormData {
    name: string;
    marketingCampaign: FormMarketingCampaign;
    type: ('email' | 'telegram')[];
    sendDate: Date;
    status: string;
    attachments: { name: string; path: string }[];
    content: {
        email?: AdMessageContentEmail;
        telegram?: AdMessageContentTelegram;
    };
}

export type FormMarketingCampaign = {
    _id: string;
    name: string;
    startDate: string | Date;
    endDate: string | Date;
};