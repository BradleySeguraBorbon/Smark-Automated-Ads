import { Types, Document } from 'mongoose';
import { TagRef } from './Tag';
import { ClientRef } from './Client';
import { UserRef } from './User';

interface CampaignTag {
    tag: TagRef;
    priority: number;
}

interface Performance {
    totalEmailsSent: number;
    totalEmailsOpened: number;
    telegramMessagesSent: number;
    telegramMessagesOpened: number;
}

export interface MarketingCampaignRef {
    _id: Types.ObjectId;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'completed';
}

export interface IMarketingCampaign extends Document {
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'completed';
    startDate: Date;
    endDate: Date;
    tags: CampaignTag[]; 
    audiencePreview: ClientRef[]; 
    users: UserRef[]; 
    performance: Performance; 
    createdAt?: Date;
    updatedAt?: Date; 
}