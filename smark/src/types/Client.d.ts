
import { Types, Document } from "mongoose";
import { TagRef } from "./Tag";
import { AdMessageRef } from "./AdMessage";

export interface AdInteractions {
    adMessage: AdMessageRef;
    status: "opened" | "received";
}

export interface ClientRef {
    _id: Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
}

export interface IClient extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    telegramChatId: string;
    preferredContactMethod: string;
    subscriptions: string[];
    birthDate: string;
    preferences: string[];
    tags: TagRef[];
    adInteractions: AdInteractions[];
    createdAt?: Date;
    updatedAt?: Date;
}

