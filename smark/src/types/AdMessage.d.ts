import { Types, Document } from 'mongoose';

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

export interface IAdMessage extends Document {
  name: string;
  marketingCampaign: Types.ObjectId;
  type: ('email' | 'telegram')[];
  status?: 'sent' | 'editing' | 'programmed';
  content: {
    email?: AdMessageContentEmail;
    telegram?: AdMessageContentTelegram;
  };
  attachments?: string[];
  template?: Types.ObjectId;
  sendDate: Date;
};
