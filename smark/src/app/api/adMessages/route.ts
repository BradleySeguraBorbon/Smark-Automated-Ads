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
            .populate('marketingCampaign', ['name', 'description', 'status'])
            .populate('template', ['_id', 'name', 'type']);

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
            'status', 'content', 'attachments',
            'template', 'sendDate'
        ];

        const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);

        const { name, marketingCampaign, type, status, content, attachments, template, sendDate } = body;

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields.`, missingFields },
                { status: 400 }
            );
        }

        if (isNaN(Date.parse(body.sendDate))) {
            return NextResponse.json({ message: 'Invalid sendDate format' }, { status: 400 });
        }

        if (!isValidObjectId(marketingCampaign) || !(await MarketingCampaigns.findById(marketingCampaign))) {
            return NextResponse.json({ message: 'Invalid or non-existent marketingCampaign' }, { status: 400 });
        }

        if (!isValidObjectId(template) || !(await Templates.findById(template))) {
            return NextResponse.json({ message: 'Invalid or non-existent template' }, { status: 400 });
        }

        const adMessage = await AdMessages.create({
            name,
            marketingCampaign,
            type,
            status,
            content,
            attachments,
            template,
            sendDate,
        });

        const savedAdMessage = await AdMessages.findById(adMessage._id)
            .populate('marketingCampaign', 'name description status')
            .populate('template', '_id name type');

        return NextResponse.json({ 
            message: 'AdMessage created successfully', savedAdMessage },
            { status: 201 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Error creating AdMessage' }, { status: 500 }
        );
    }

}