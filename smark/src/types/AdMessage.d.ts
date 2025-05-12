import { Types, Document } from 'mongoose';
import { MarketingCampaignRef } from './MarketingCampaign';
import { TemplateRef } from './Template';

export interface AdMessageContentEmail {
    subject: string;
    body: string;
    openRate?: number;
    clickRate?: number;
    bounceRate?: number;
    template: TemplateRef;
}

export interface AdMessageContentTelegram {
    message: string;
    buttons: string[];
    parseMode?: 'Markdown' | 'HTML';
    views?: number;
    clicks?: number;
    template: TemplateRef;
}

export interface AdMessageRef {
  _id: Types.ObjectId;
  name: string;
  type: ('email' | 'telegram')[];
  content: {
    email?: {
      template: TemplateRef;
    };
    telegram?: {
      template: TemplateRef;
    };
  };
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
  attachments?: { name: string; path: string }[];
  sendDate: Date;
};
