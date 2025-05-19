import mongoose, { Model } from 'mongoose';
import { IAdMessage } from '@/types/AdMessage';

const adMessagesSchema = new mongoose.Schema<IAdMessage>(
  {
    name: { type: String, required: true },
    marketingCampaign: { type: mongoose.Schema.Types.ObjectId, ref: "MarketingCampaigns", required: true },
    type: [{ type: String, enum: ["email", "telegram"], required: true }],
    status: { type: String, enum: ["sent", "editing", "programmed"], default: "editing" },
    content: {
      email: {
        subject: { type: String, required: true },
        body: { type: String, required: true },
        openRate: { type: Number, default: 0 },
        clickRate: { type: Number, default: 0 },
        bounceRate: { type: Number, default: 0 },
        template: { type: mongoose.Schema.Types.ObjectId, ref: "Templates", required: true },
      },
      telegram: {
        message: { type: String, required: true },
        buttons: [{
          text: { type: String, required: true },
          url: { type: String, required: true }
        }],
        parseMode: { type: String, enum: ["Markdown", "HTML"], default: "Markdown" },
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        template: { type: mongoose.Schema.Types.ObjectId, ref: "Templates", required: true },
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