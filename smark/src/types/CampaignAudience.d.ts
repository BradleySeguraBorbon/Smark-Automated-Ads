import { Types, Document } from "mongoose";
import { MarketingCampaignRef } from "./MarketingCampaign";
import { ClientRef } from "./Client";

export interface ICampaignAudience extends Document {
    campaign: MarketingCampaignRef;
    audience: ClientRef[]; 
    status: 'approved' | 'pending' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
}