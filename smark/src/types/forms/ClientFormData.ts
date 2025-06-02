import { TagRef } from "@/types/Tag";
import { AdInteractions } from "@/types/Client";

export interface ClientFormData {
    _id?: string;
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