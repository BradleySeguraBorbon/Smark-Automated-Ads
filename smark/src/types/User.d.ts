
import { Types } from "mongoose";

export interface IUser extends Document {
    username: string;
    password: string;
    marketingCampaigns: Types.ObjectId[];
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
}