import mongoose, { Schema, Types } from 'mongoose';
import { Model } from 'mongoose';
import {IClientRaw} from '@/types/Client';

const adInteractionsSchema = new Schema({
  adMessage: { type: Types.ObjectId, ref: "AdMessages", required: true },
  status: { type: String, enum: ["opened", "received"], required: true },
});

const clientSchema = new Schema<IClientRaw>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  preferredContactMethod: { type: String, required: true },
  subscriptions: [{ type: String, required: true }],
  birthDate: { type: String, required: true },
  preferences: [{ type: String, required: true }],
  tags: [{ type: Types.ObjectId, ref: "Tags" }],
  adInteractions: [adInteractionsSchema],
  tagsPending: { type: Boolean, default: false },
  telegram: {
    tokenKey: { type: String },
    chatId: { type: String },
    isConfirmed: { type: Boolean, default: false },
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer_not_to_say'],
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  languages: {
    type: [String],
    required: false,
  },
}, {
  timestamps: true,
  validateBeforeSave: true,
  strict:true
});


/*clientSchema.pre("validate", function (next) {
  const client = this as IClient;

  const hasEmail = !!client.email;
  const hasTelegram = !!client.telegram;

  if (!hasEmail && !hasTelegram) {
    return next(new Error("Client must have at least one contact method: email or telegramChatId."));
  }

  if (client.preferredContactMethod === "email" && !hasEmail) {
    return next(new Error("Preferred contact method is email, but email is missing."));
  }

  if (client.preferredContactMethod === "telegram" && !hasTelegram) {
    return next(new Error("Preferred contact method is telegram, but telegramChatId is missing."));
  }

  next();
});*/

const Clients = mongoose.models.Clients as Model<IClientRaw> || mongoose.model<IClientRaw>('Clients', clientSchema);
export default Clients;