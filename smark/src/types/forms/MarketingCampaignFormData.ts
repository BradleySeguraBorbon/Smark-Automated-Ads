import { TagRef } from "@/types/Tag";
import { UserRef } from "@/types/User";
import { Performance } from "@/types/MarketingCampaign";

export interface MarketingCampaignFormData {
    _id?: string;
    name: string;
    description: string;
    status: "active" | "inactive" | "completed";
    startDate: Date;
    endDate: Date;
    tags: TagRef[];
    users: UserRef[];
    performance: Performance;
    audienceCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}