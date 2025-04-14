import mongoose, { Model } from 'mongoose';
import { IMarketingCampaign } from "../types/MarketingCampaign";

const marketingCampaignSchema = new mongoose.Schema<IMarketingCampaign>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "completed"],
            default: "inactive",
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        tags: [{
            tagId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tags",
                required: true,
            },
            priority: {
                type: Number,
                required: true,
            }
        }],
        audiencePreview: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Clients",
                required: true,
            }],
            validate: {
                validator: function (value: mongoose.Types.ObjectId[]) {
                    return value.length <= 10;
                },
                message: "You can only have a maximum of 10 clients in the audience preview."
            }
        },
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        }],
        performance: {
            totalEmailsSent:{
                type: Number,
                default: 0,
            },
            totalEmailsOpened:{
                type: Number,
                default: 0,
            },
            telegramMessagesSent:{
                type: Number,
                default: 0,
            },
            telegramMessagesOpened:{
                type: Number,
                default: 0,
            },
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.MarketingCampaigns as Model<IMarketingCampaign> || mongoose.model<IMarketingCampaign>('MarketingCampaigns', marketingCampaignSchema);
