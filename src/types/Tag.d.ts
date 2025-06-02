import { Document } from 'mongoose';

export interface TagRef {
    _id: string;
    name: string;
}

export interface ITag extends Document {
    name: string;
    keywords: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

