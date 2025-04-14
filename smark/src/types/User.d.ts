
import { Types } from "mongoose";

export interface IUser extends Document {
    username: string;
    password: string;
    marketingCampaigns: Types.ObjectId[];
    rol: string;
    createdAt?: Date;
    updatedAt?: Date;
}