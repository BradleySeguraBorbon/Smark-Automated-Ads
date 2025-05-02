import mongoose, { Schema, Model } from 'mongoose';
import { ITemplate } from '../types/Template';

const templateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['email', 'telegram'], required: true },
    html: { type: String, required: true },
    placeholders: { type: [String], required: true }
  },
  {
    timestamps: true
  }
);

const Templates = mongoose.models.Templates as Model<ITemplate> || mongoose.model<ITemplate>('Templates', templateSchema);
export default Templates;
