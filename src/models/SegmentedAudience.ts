import mongoose, { Schema, model, models, Model, Document, Types } from 'mongoose';

export interface SegmentGroup {
    criterion: string;
    value: string;
    clientIds: Types.ObjectId[];
    reason: string;
}

export interface ISegmentedAudience extends Document {
    coverage: number;
    totalClients: number;
    selectedClients: Types.ObjectId[];
    segmentGroups: SegmentGroup[];
    createdAt?: Date;
}

const groupSchema = new Schema({
    criterion: { type: String, required: true },
    value: { type: String, required: true },
    clientIds: [{ type: Schema.Types.ObjectId, ref: 'Clients', required: true }],
    reason: { type: String, required: true },
});

const segmentedAudienceSchema = new Schema<ISegmentedAudience>(
    {
        coverage: { type: Number, required: true },
        totalClients: { type: Number, required: true },
        selectedClients: [{ type: Schema.Types.ObjectId, ref: 'Clients', required: true }],
        segmentGroups: [groupSchema],
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        strict: true,
    }
);

const SegmentedAudience =
    models.SegmentedAudience as Model<ISegmentedAudience> ||
    model<ISegmentedAudience>('SegmentedAudience', segmentedAudienceSchema);

export default SegmentedAudience;
