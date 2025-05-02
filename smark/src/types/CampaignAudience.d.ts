import { Types } from "mongoose";

export interface ICampaignAudience extends Document{
    campaign: Types.ObjectId;
    audience: Types.ObjectId[]; 
    status: 'approved' | 'pending' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
}