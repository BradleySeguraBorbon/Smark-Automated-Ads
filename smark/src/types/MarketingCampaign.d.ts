import { Types, Document } from 'mongoose';
import { TagRef } from './Tag';
import { UserRef } from './User';

interface Performance {
    totalEmailsSent: number | 0;
    totalEmailsOpened: number | 0;
    telegramMessagesSent: number | 0;
    telegramMessagesOpened: number | 0;
}

export interface MarketingCampaignRef {
    _id: Types.ObjectId;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'completed';
    startDate: Date;
    endDate: Date;
}

export interface IMarketingCampaign extends Document {
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'completed';
    startDate: Date;
    endDate: Date;
    tags: TagRef[];  
    users: UserRef[]; 
    performance: Performance;
    audienceCount?: number;
    isAiGenerated?: boolean;
    createdAt?: Date;
    updatedAt?: Date; 
}

export interface MarketingCampaignFormData {
    _id?: Types.ObjectId;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'completed';
    startDate: Date;
    endDate: Date;
    tags: TagRef[];
    users: UserRef[]; 
    performance: Performance;
    isAiGenerated: boolean,
}