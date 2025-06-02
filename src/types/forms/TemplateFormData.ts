export interface TemplateFormData {
    _id?: string;
    name: string;
    type: "email" | "telegram";
    html: string;
    placeholders: string[];
    createdAt?: Date;
    updatedAt?: Date;
}