import mongoose, { Schema, Types } from 'mongoose';
import { Model } from 'mongoose';
import { IClient } from '../types/Client';

const adInteractionsSchema = new Schema({
  ad_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["opened", "received"],
    required: true,
  },
});

const clientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  telegramUsername: {
    type: String,
    required: true,
  },
  preferredContactMethod: {
    type: String,
    required: true,
  },
  subscriptions: [
    {
      type: String,
      enum: ["email", "telegram"],
      required: true,
    },
  ],
  birthDate: {
    type: Date,
    required: true,
  },
  preferences: [
    {
      type: String,
      required: true,
    },
  ],
  tags: [
    {
      type: Types.ObjectId,
      ref: "Tags",
    },
  ],
  marketingCampaigns: [
    {
      type: Types.ObjectId,
      ref: "MarketingCampaign",
    },
  ],
  adInteractions: [adInteractionsSchema], 
}, 
{
  timestamps: true, 
});

export default mongoose.models.Clients as Model<IClient> || mongoose.model<IClient>('Clients', clientSchema);