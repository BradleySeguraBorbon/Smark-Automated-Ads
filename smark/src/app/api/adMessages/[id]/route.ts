import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/config/db';
import { getUserFromRequest } from '@/lib/auth';
import { AdMessages, MarketingCampaigns, Templates } from '@/models/models';

function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: Request) {
    try {
        await connectDB();

        const allowedRoles = ['admin', 'developer', 'employee'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);

        const id = searchParams.get('id');

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ message: 'Invalid or missing id parameter' }, { status: 400 });
        }

        const adMessage = await AdMessages.findById(id)
            .populate('marketingCampaign', '_id name description status')
            .populate('content.email.template', '_id name type')
            .populate('content.telegram.template', '_id name type');

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const allowedRoles = ['admin', 'developer', 'employee'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { id } = await params;

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json({ message: 'Invalid or missing id parameter' }, { status: 400 });
        }

        const requiredFields = [
            'name', 'marketingCampaign', 'type',
            'status', 'content', 'sendDate'
        ];

        const body = await request.json();

        const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: 'Missing required fields.', missingFields },
                { status: 400 }
            );
        }

        if (!Array.isArray(attachments)) {
            return NextResponse.json({ message: 'Attachments must be an array' }, { status: 400 });
        }

        for (const att of attachments) {
            if (typeof att !== 'object' || !att.name || !att.path) {
                return NextResponse.json({ message: 'Each attachment must have name and path' }, { status: 400 });
            }
        }

        const { name, marketingCampaign, type, status, content, attachments, sendDate } = body;

        if (sendDate && isNaN(Date.parse(sendDate))) {
            return NextResponse.json({ message: 'Invalid sendDate format' }, { status: 400 });
        }

        if (marketingCampaignId) {
            if (!isValidObjectId(marketingCampaignId) || !(await MarketingCampaigns.findById(marketingCampaignId))) {
                return NextResponse.json({ message: 'Invalid or non-existent marketingCampaignId' }, { status: 400 });
            }
        }

        if (type.includes('email')) {
            const emailTemplate = content?.email?.template;
            if (!isValidObjectId(emailTemplate) || !(await Templates.findById(emailTemplate))) {
                return NextResponse.json({ message: 'Invalid or missing email template' }, { status: 400 });
            }
        }

        if (type.includes('telegram')) {
            const telegramTemplate = content?.telegram?.template;
            if (!isValidObjectId(telegramTemplate) || !(await Templates.findById(telegramTemplate))) {
                return NextResponse.json({ message: 'Invalid or missing telegram template' }, { status: 400 });
            }
        }

        const adMessage = await AdMessages.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true });

        if (!adMessage) {
            return NextResponse.json({ message: 'AdMessage not found' }, { status: 404 });
        }

        const updatedAdMessage = await adMessage
            .populate('marketingCampaign', '_id name description status')
            .populate('content.email.template', '_id name type')
            .populate('content.telegram.template', '_id name type');

        return NextResponse.json({
            message: 'AdMessage updated successfully',
            result: updatedAdMessage,
        });
    } catch (error: any) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ error: error.message }, { status: 422 });
        }
        return NextResponse.json({ error: 'Error updating AdMessage' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const allowedRoles = ['admin', 'developer', 'employee'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { id } = await params;

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