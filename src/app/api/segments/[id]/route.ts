import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import SegmentedAudience from '@/models/SegmentedAudience';
import mongoose from 'mongoose';

export async function DELETE(
    req: NextRequest,
    context: Record<string, any>
) {
    try {
        await connectDB();

        const id = context.params?.id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid or missing segment ID' }, { status: 400 });
        }

        const deleted = await SegmentedAudience.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Segment deleted successfully',
            segment: deleted,
        });
    } catch (error: any) {
        console.error('[DELETE SEGMENT ERROR]', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
