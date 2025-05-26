import { Document } from 'mongoose';

export interface TemplateRef {
    _id: Types.ObjectId;
    name: string;
    type: 'email' | 'telegram';
}

export interface ITemplate extends Document {
    name: string;
    type: 'email' | 'telegram';
    html: string;
    placeholders: string[];
    createdAt?: Date;
    updatedAt?: Date;
}