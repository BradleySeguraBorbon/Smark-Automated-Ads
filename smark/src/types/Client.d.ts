
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
    preferredContactMethod: string;
    birthDate: Date;
}

export interface IClientRaw extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferredContactMethod: string;
    subscriptions: string[];
    birthDate: string;
    preferences: string[];
    tags: TagRef[];
    adInteractions: AdInteractions[];
    tagsPending: boolean;
    telegram?: {
        tokenKey: string;
        chatId?: string;
        isConfirmed: boolean;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IClient {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferredContactMethod: "email" | "telegram";
    subscriptions: string[];
    birthDate: Date;
    preferences: string[];
    tags: TagRef[];
    adInteractions: AdInteractions[];
    tagsPending: boolean;
    telegram?: {
        tokenKey: string;
        chatId?: string;
        isConfirmed: boolean;
    };
    createdAt?: Date;
    updatedAt?: Date;
}
