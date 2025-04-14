import mongoose, { Schema, Document, Types, Model } from "mongoose";
import { IUser } from "../types/User";

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    marketingCampaigns: [
      { type: Schema.Types.ObjectId, ref: "MarketingCampaign", required: true }
    ],
    role: { type: String, required: true, enum: ["admin", "employee"] }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.User as Model<IUser> || mongoose.model<IUser>('Users', userSchema);
