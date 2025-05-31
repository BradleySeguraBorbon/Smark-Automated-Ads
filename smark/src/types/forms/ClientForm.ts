export interface ClientFormFields {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferredContactMethod: "email" | "telegram";
    subscriptions: string[];
    birthDate: Date;
    preferences: string[];
    tags: string[];
    adInteractions: {
        adMessage: string;
        status: "opened" | "received";
    }[];
    tagsPending: boolean;
    telegram?: {
        tokenKey: string;
        chatId?: string;
        isConfirmed: boolean;
    };
    createdAt?: Date;
    updatedAt?: Date;
}
