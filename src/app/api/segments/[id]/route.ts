import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import SegmentedAudience from '@/models/SegmentedAudience';
import mongoose from 'mongoose';

export async function DELETE(
    request: Request, { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid or missing segment ID' }, { status: 400 });
        }
console.log("Deleting segment with ID:", id);
        const deleted = await SegmentedAudience.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
        }
console.log("Delted segment:", deleted);
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
