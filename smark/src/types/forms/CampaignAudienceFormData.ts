import { ClientRef } from "@/types/Client";
import { MarketingCampaignRef } from "../MarketingCampaign";

export interface CampaignAudienceFormData {
    _id?: string;
    campaign: MarketingCampaignRef;
    audience: ClientRef[];
    status: "approved" | "pending" | "rejected";
    createdAt?: Date;
    updatedAt?: Date;
}