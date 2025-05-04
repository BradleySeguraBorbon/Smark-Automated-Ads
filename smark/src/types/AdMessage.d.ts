import { Types, Document } from 'mongoose';
import { MarketingCampaignRef } from './MarketingCampaign';
import { TemplateRef } from './Template';

export interface AdMessageContentEmail {
    subject: string;
    body: string;
    senderEmail: string;
    recipients: string[];
    cc?: string[];
    openRate?: number;
    clickRate?: number;
    bounceRate?: number;
}

export interface AdMessageContentTelegram {
    chatId: string;
    message: string;
    buttons: string[];
    parseMode?: 'Markdown' | 'HTML';
    views?: number;
    clicks?: number;
}

export interface AdMessageRef {
  _id: Types.ObjectId;
  name: string;
  type: "email" | "telegram";
}

export interface IAdMessage extends Document {
  name: string;
  marketingCampaign: MarketingCampaignRef;
  type: ('email' | 'telegram')[];
  status?: 'sent' | 'editing' | 'programmed';
  content: {
    email?: AdMessageContentEmail;
    telegram?: AdMessageContentTelegram;
  };
  attachments?: string[];
  template?: TemplateRef;
  sendDate: Date;
};
