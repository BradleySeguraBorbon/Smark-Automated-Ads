import { MarketingCampaignRef } from "../MarketingCampaign";

export interface UserFormData {
    _id?: string;
    username: string;
    password: string;
    email: string;
    marketingCampaigns: MarketingCampaignRef[];
    role: "admin" | "employee" | "developer";
    createdAt?: Date;
    updatedAt?: Date;
}