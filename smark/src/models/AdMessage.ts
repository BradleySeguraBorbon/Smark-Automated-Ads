import mongoose, { Model } from 'mongoose';
import { IAdMessage } from '@/types/AdMessage';

const adMessagesSchema = new mongoose.Schema<IAdMessage>(
    {
        name: { type: String, required: true},
        MarketingCampaignId: { type: mongoose.Schema.Types.ObjectId, ref: "MarketingCampaign", required: true},
        type: [ { type: String, enum: ["email", "telegram"], required: true } ],
        status: { type: String, enum: ["sent", "editing", "programmed"], default: "editing" },
        content: {
            email: {
                subject: {
                    type: String,
                    required: true
                },
                body: {
                    type: String,
                    required: true
                },
                senderEmail: {
                    type: String,
                    required: true
                },
                recipients: [{
                    type: String,
                    required: true
                }],
                cc: [{
                    type: String,
                }],
                openRate: {
                    type: Number,
                    default: 0
                },
                clickRate: {
                    type: Number,
                    default: 0
                },
                bounceRate: {
                    type: Number,
                    default: 0
                }
            },
            telegram: {
                chatId: {
                    type: String,
                    required: true
                },
                message: {
                    type: String,
                    required: true
                },
                buttons: [{
                    type: String,
                    required: true
                }],
                parseMode: {
                    type: String,
                    enum: ["Markdown", "HTML"],
                    default: "Markdown"
                },
                views: {
                    type: Number,
                    default: 0
                },
                clicks: {
                    type: Number,
                    default: 0
                }
            }
        },
        attachments: [{
            type: String
        }],
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Templates"
        },
        sendDate: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.AdMessages as Model<IAdMessage> || mongoose.model<IAdMessage>('AdMessages', adMessagesSchema);