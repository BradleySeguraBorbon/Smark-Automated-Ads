import mongoose, { Model } from 'mongoose';
import { IAdMessage } from '@/types/AdMessage';

const adMessagesSchema = new mongoose.Schema<IAdMessage>(
  {
    name: { type: String, required: true },
    marketingCampaign: { type: mongoose.Schema.Types.ObjectId, ref: "MarketingCampaigns", required: true },
    type: [{ type: String, enum: ["email", "telegram"], required: true }],
    status: { type: String, enum: ["sent", "programmed", "draft"], default: "programmed" },
    content: {
      email: {
        subject: { type: String},
        body: { type: String},
        openRate: { type: Number, default: 0 },
        clickRate: { type: Number, default: 0 },
        bounceRate: { type: Number, default: 0 },
        template: { type: mongoose.Schema.Types.ObjectId, ref: "Templates" },
      },
      telegram: {
        message: { type: String },
        buttons: [{
          text: { type: String },
          url: { type: String }
        }],
        parseMode: { type: String, enum: ["Markdown", "HTML"], default: "Markdown" },
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        template: { type: mongoose.Schema.Types.ObjectId, ref: "Templates" },
      }
    },
    attachments: [
      { name: { type: String, required: true }, path: { type: String, required: true } }
    ],
    sendDate: { type: Date, required: true }
  },
  {
    timestamps: true,
    strict:true
  }
);

const AdMessages = mongoose.models.AdMessages as Model<IAdMessage> || mongoose.model<IAdMessage>('AdMessages', adMessagesSchema);
export default AdMessages;