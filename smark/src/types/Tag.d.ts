import { Document } from 'mongoose';

export interface ITag extends Document {
    name: string;
    keywords: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

