import { Document } from 'mongoose';

export interface TagRef {
    _id: Types.ObjectId;
    name: string;
}

export interface ITag extends Document {
    name: string;
    keywords: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

