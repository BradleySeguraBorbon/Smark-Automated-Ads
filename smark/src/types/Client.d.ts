
import { Types } from "mongoose";

export interface AdInteractions {
    ad_id: string;
    status: "opened" | "received";

}

export interface IClient extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    telegramUsername: string;
    preferredContactMethod: string;
    subscriptions: ("email" | "telegram")[];
    birthDate: Date;
    preferences: string[];
    tags: Types.ObjectId[];
    marketingCampaigns: Types.ObjectId[];
    adInteractions: AdInteractions[];
    createdAt?: Date;
    updatedAt?: Date;
}

