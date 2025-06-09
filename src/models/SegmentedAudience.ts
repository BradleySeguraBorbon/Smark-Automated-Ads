import mongoose, { Schema, model, models } from 'mongoose';

const groupSchema = new Schema({
    criterion: { type: String, required: true },
    value: { type: String, required: true },
    clientIds: [{ type: Schema.Types.ObjectId, ref: 'Clients', required: true }],
    reason: { type: String, required: true },
});

const segmentedAudienceSchema = new Schema({
    coverage: { type: Number, required: true },
    totalClients: { type: Number, required: true },
    selectedClients: [{ type: Schema.Types.ObjectId, ref: 'Clients', required: true }],
    segmentGroups: [groupSchema],
    createdAt: { type: Date, default: Date.now },
});

const SegmentedAudience = models.SegmentedAudience || model('SegmentedAudience', segmentedAudienceSchema);
export default SegmentedAudience;
