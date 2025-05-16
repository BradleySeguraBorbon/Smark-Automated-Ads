import mongoose, { Schema, Types } from 'mongoose';
import { Model } from 'mongoose';
import { IClient } from '../types/Client';

const adInteractionsSchema = new Schema({
  adMessage: { type: Types.ObjectId, ref: "AdMessages", required: true },
  status: { type: String, enum: ["opened", "received"], required: true },
});

const clientSchema = new Schema<IClient>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  telegramChatId: { type: String, unique: true },
  preferredContactMethod: { type: String, required: true },
  subscriptions: [{ type: String, required: true }],
  birthDate: { type: String, required: true },
  preferences: [{ type: String, required: true }],
  tags: [{ type: Types.ObjectId, ref: "Tags" }],
  adInteractions: [adInteractionsSchema],
}, {
  timestamps: true,
  validateBeforeSave: true
});


/*clientSchema.pre("validate", function (next) {
  const client = this as IClient;

  const hasEmail = !!client.email;
  const hasTelegram = !!client.telegramChatId;

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

const Clients = mongoose.models.Clients as Model<IClient> || mongoose.model<IClient>('Clients', clientSchema);
export default Clients;