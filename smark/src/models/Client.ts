import mongoose, { Schema, Types } from 'mongoose';
import { Model } from 'mongoose';
import { IClient } from '../types/Client';

const adInteractionsSchema = new Schema({
  ad_id: { type: String, required: true },
  status: { type: String, enum: ["opened", "received"], required: true },
});

const clientSchema = new Schema<IClient>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  telegramUsername: { type: String, unique: true },
  preferredContactMethod: { type: String, enum: ["email", "telegram"], required: true },
  subscriptions: [{ type: String, enum: ["email", "telegram"], required: true }],
  birthDate: { type: Date, required: true },
  preferences: [{ type: String, required: true }],
  tags: [{ type: Types.ObjectId, ref: "Tags" }],
  marketingCampaigns: [{ type: Types.ObjectId, ref: "MarketingCampaign" }],
  adInteractions: [adInteractionsSchema],
}, {
  timestamps: true,
  validateBeforeSave: true
});


clientSchema.pre("validate", function (next) {
  const client = this as IClient;

  const hasEmail = !!client.email;
  const hasTelegram = !!client.telegramUsername;

  if (!hasEmail && !hasTelegram) {
    return next(new Error("Client must have at least one contact method: email or telegramUsername."));
  }

  if (client.preferredContactMethod === "email" && !hasEmail) {
    return next(new Error("Preferred contact method is email, but email is missing."));
  }

  if (client.preferredContactMethod === "telegram" && !hasTelegram) {
    return next(new Error("Preferred contact method is telegram, but telegramUsername is missing."));
  }

  next();
});


export default mongoose.models.Clients as Model<IClient> || mongoose.model<IClient>('Clients', clientSchema);