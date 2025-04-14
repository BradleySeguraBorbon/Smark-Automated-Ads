export interface ITemplate extends Document {
    name: string;
    type: 'email' | 'telegram';
    html: string;
    placeholders: string[];
    createdAt?: Date;
    updatedAt?: Date;
}