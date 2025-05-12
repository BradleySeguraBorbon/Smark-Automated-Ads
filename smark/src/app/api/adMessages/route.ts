import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { getUserFromRequest } from '@/lib/auth';
import { MarketingCampaigns, AdMessages, Templates } from '@/models/models';

function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: Request) {
    try {
        await connectDB();

        const allowedRoles = ['admin', 'employee', 'developer'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);

        const filter: Record<string, any> = {};

        if (searchParams.has('status')) {
            filter.status = searchParams.get('status');
        }

        if (searchParams.has('type')) {
            const types = searchParams.getAll('type');
            filter.type = { $in: types };
        }

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return NextResponse.json(
                { message: 'Invalid parameters: page and limit should be greater than 0.' },
                { status: 400 }
            );
        }

        const skip = (page - 1) * limit;

        const total = await AdMessages.countDocuments(filter);
        const adMessages = await AdMessages.find(filter).skip(skip).limit(limit)
            .populate('marketingCampaign', '_id name description status startDate endDate')
            .populate('content.email.template', '_id name type')
            .populate('content.telegram.template', '_id name type');

        if (adMessages.length === 0) {
            return NextResponse.json({ message: 'No AdMessages found' }, { status: 404 });
        }

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            total,
            totalPages,
            page,
            limit,
            results: adMessages
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching ad messages' }, { status: 500 });
    }
}

export async function POST(request: Request) {

    try {
        await connectDB();

        const allowedRoles = ['admin', 'employee', 'developer'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const body = await request.json();

        const requiredFields = [
            'name', 'marketingCampaign', 'type',
            'status', 'content', 'sendDate'
        ];

        const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);

        const { name, marketingCampaign, type, status, content, attachments, sendDate } = body;

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields.`, missingFields },
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


        if (isNaN(Date.parse(body.sendDate))) {
            return NextResponse.json({ message: 'Invalid sendDate format' }, { status: 400 });
        }

        if (!isValidObjectId(marketingCampaign) || !(await MarketingCampaigns.findById(marketingCampaign))) {
            return NextResponse.json({ message: 'Invalid or non-existent marketingCampaign' }, { status: 400 });
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

        const adMessage = await AdMessages.create({
            name,
            marketingCampaign,
            type,
            status,
            content,
            attachments,
            sendDate,
        });

        const savedAdMessage = await AdMessages.findById(adMessage._id)
            .populate('marketingCampaign', '_id name description status startDate endDate')
            .populate('content.email.template', '_id name type')
            .populate('content.telegram.template', '_id name type');

        return NextResponse.json({
            message: 'AdMessage created successfully', savedAdMessage
        },
            { status: 201 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Error creating AdMessage' }, { status: 500 }
        );
    }

}