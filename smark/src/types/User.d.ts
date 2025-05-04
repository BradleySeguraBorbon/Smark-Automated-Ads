import { Types, Document } from "mongoose";
import { MarketingCampaignRef } from "./MarketingCampaign";

export interface UserRef {
    _id: Types.ObjectId;
    username: string;
    role: string;
}

export interface IUser extends Document {
    username: string;
    password: string;
    marketingCampaigns: MarketingCampaignRef[];
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
}