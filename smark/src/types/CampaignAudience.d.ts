import { Types } from "mongoose";

export interface ICampaignAudience extends Document{
    campaignId: string;
    audience: Types.ObjectId[]; 
    status: 'approved' | 'pending' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
}