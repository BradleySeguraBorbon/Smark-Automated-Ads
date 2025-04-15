import { ICampaignAudience } from '@/types/CampaignAudience';
import mongoose, { Schema, Model } from 'mongoose';

const campaignAudienceSchema = new Schema<ICampaignAudience>(
  {
    campaignId: { type: String, required: true },
    audience: { type: [Schema.Types.ObjectId], ref: 'Client', required: true },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], required: true },
  },
  { timestamps: true }
);

const CampaignAudiences = mongoose.models.CampaignAudiences as Model<ICampaignAudience> || mongoose.model<ICampaignAudience>('CampaignAudiences', campaignAudienceSchema);
export default CampaignAudiences;
