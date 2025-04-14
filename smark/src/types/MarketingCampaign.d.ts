import { Types } from 'mongoose';

interface Tag {
    tagId: Types.ObjectId;
    priority: number;
}

interface Performance {
    totalEmailsSent: number;
    totalEmailsOpened: number;
    telegramMessagesSent: number;
    telegramMessagesOpened: number;
}

export interface IMarketingCampaign extends Document {
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'completed';
    startDate: Date;
    endDate: Date;
    tags: Tag[]; 
    audiencePreview: Types.ObjectId[]; 
    users: Types.ObjectId[]; 
    performance: Performance; 
    createdAt?: Date;
    updatedAt?: Date; 
}