import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/config/db';
import AdMessages from '@/models/AdMessage';

function getMissingFields(body: any, requiredFields: string[]) {
    return requiredFields.filter(field => body[field] === undefined || body[field] === null);
}

function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);

        const id = searchParams.get('id');

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ message: 'Invalid or missing id parameter' }, { status: 400 });
        }

        const adMessage = await AdMessages.findById(id)
            .populate('MarketingCampaignId', ['name', 'description', 'status', 'endDate']).populate('templateId', ['name', 'type', 'html']);

        if (!adMessage) {
            return NextResponse.json({ message: 'No AdMessages found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'AdMessage found',
            result: adMessage,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error getting AdMessage' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ message: 'Invalid or missing id parameter' }, { status: 400 });
        }

        const body = await request.json();

        const requiredFields = [
            'name', 'MarketingCampaignId',
            'type', 'status',
            'content', 'attachments',
            'templateId', 'sendDate'
        ];

        const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        if (isNaN(Date.parse(body.sendDate))) {
            return NextResponse.json({ message: 'Invalid sendDate format' }, { status: 400 });
        }

        const adMessage = await AdMessages.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!adMessage) {
            return NextResponse.json({ message: 'AdMessage not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'AdMessage updated successfully',
            result: adMessage,
        });
    } catch (error: any) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ error: error.message }, { status: 422 });
        }
        return NextResponse.json({ error: 'Error updating AdMessage' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ message: 'Invalid or missing id parameter' }, { status: 400 });
        }

        const adMessageDeleted = await AdMessages.findByIdAndDelete(id);

        if (!adMessageDeleted) {
            return NextResponse.json({ message: 'AdMessage not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'AdMessage deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting AdMessage' }, { status: 500 });
    }
}