import mongoose, { Model } from 'mongoose';
import Tags from './Tag';
import Clients from './Client';
import Users from './User';
import { IMarketingCampaign } from "@/types/MarketingCampaign";

const marketingCampaignSchema = new mongoose.Schema<IMarketingCampaign>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive", "completed"], default: "inactive" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tags: [{ type: mongoose.Types.ObjectId, ref: "Tags" }],
    audienceCount: { type: Number },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    }],
    performance: {
      totalEmailsSent: { type: Number, default: 0 },
      totalEmailsOpened: { type: Number, default: 0 },
      telegramMessagesSent: { type: Number, default: 0 },
      telegramMessagesOpened: { type: Number, default: 0 }
    },
    isAiGenerated: { type: Boolean, default: false }
  },
  {
    timestamps: true,
      strict:true
  }
);

 const MarketingCampaigns = mongoose.models.MarketingCampaigns as Model<IMarketingCampaign> || mongoose.model<IMarketingCampaign>('MarketingCampaigns', marketingCampaignSchema);
 export default MarketingCampaigns;