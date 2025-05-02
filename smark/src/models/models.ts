// models.ts or db/models.ts
import mongoose from 'mongoose';
import './Tag';
import './User';
import './Client';
import './MarketingCampaign';
import './Template';
import './AdMessage';
import './CampaignAudience';

export const Tags = mongoose.model('Tags');
export const Users = mongoose.model('Users');
export const Clients = mongoose.model('Clients');
export const MarketingCampaigns = mongoose.model('MarketingCampaigns');
export const Templates = mongoose.model('Templates');
export const AdMessages = mongoose.model('AdMessages');
export const CampaignAudiences = mongoose.model('CampaignAudiences');