import mongoose, { Schema, Model } from 'mongoose';
import { ITag } from '@/types/Tag';

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true },
    keywords: [{ type: String, required: true }]
  },
  {
    timestamps: true,
      strict:true
  }
);

const Tags = mongoose.models.Tags as Model<ITag> || mongoose.model<ITag>('Tags', tagSchema);
export default Tags;
