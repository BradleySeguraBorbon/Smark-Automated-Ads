import {NextResponse} from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import {getUserFromRequest} from '@/lib/auth';
import {MarketingCampaigns, AdMessages, Templates} from '@/models/models';
import {sanitizeRequest} from "@/lib/utils/sanitizeRequest";

function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: Request) {
    try {
        await connectDB();

        const allowedRoles = ['admin', 'employee', 'developer'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({error: 'Forbidden: insufficient permissions'}, {status: 403});
        }

        const {searchParams} = new URL(request.url);

        const filter: Record<string, any> = {};

        if (searchParams.has('name')) {
            const name = searchParams.get('name');
            filter.name = { $regex: name, $options: 'i' };
        }

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return NextResponse.json(
                {message: 'Invalid parameters: page and limit should be greater than 0.'},
                {status: 400}
            );
        }

        const skip = (page - 1) * limit;

        const total = await AdMessages.countDocuments(filter);
        const adMessages = await AdMessages.find(filter).skip(skip).limit(limit)
            .populate('marketingCampaign', '_id name description status startDate endDate')
            .populate('content.email.template', '_id name type')
            .populate('content.telegram.template', '_id name type');

        if (adMessages.length === 0) {
            return NextResponse.json({message: 'No AdMessages found'}, {status: 404});
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
        return NextResponse.json({error: 'Error fetching ad messages'}, {status: 500});
    }
}

export async function POST(request: Request) {
    await connectDB();

    const allowedRoles = ['admin', 'employee', 'developer'];
    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    if (!allowedRoles.includes(user.role as string)) {
        return NextResponse.json({error: 'Forbidden: insufficient permissions'}, {status: 403});
    }

    const result = await sanitizeRequest(request, {
        requiredFields: [
            'name', 'marketingCampaign', 'type',
            'status', 'content', 'sendDate'
        ],
        dates: ['sendDate'],
        enums: [
            {field: 'status', allowed: ['sent', 'programmed', 'draft']}
        ],
        enumArrays: [
            {field: 'type', allowed: ['email', 'telegram']}
        ]
    });

    if (!result.ok) return result.response;
    const body = result.data;
    const { marketingCampaign, type, content, attachments } = body;

    if (!isValidObjectId(marketingCampaign) || !(await MarketingCampaigns.findById(marketingCampaign))) {
        return NextResponse.json({ message: 'Invalid or non-existent marketingCampaign' }, { status: 400 });
    }

    if (!Array.isArray(attachments)) {
        return NextResponse.json({message: 'Attachments must be an array'}, {status: 400});
    }
    for (const att of attachments) {
        if (typeof att !== 'object' || !att.name || !att.path) {
            return NextResponse.json({message: 'Each attachment must have name and path'}, {status: 400});
        }
    }

    if (!isValidObjectId(marketingCampaign) || !(await MarketingCampaigns.findById(marketingCampaign))) {
        return NextResponse.json({message: 'Invalid or non-existent marketingCampaign'}, {status: 400});
    }

    if (type.includes('email')) {
        const email = content?.email;
        const template = email?.template;
        if (
            !email?.subject || !email?.body ||
            !isValidObjectId(template) ||
            !(await Templates.findById(template))
        ) {
            return NextResponse.json({ message: 'Invalid or missing email fields' }, { status: 400 });
        }
    } else {
        delete body.content.email;
    }

    if (type.includes('telegram')) {
        const telegram = content?.telegram;
        const template = telegram?.template;
        if (
            !telegram?.message || !Array.isArray(telegram?.buttons) ||
            !isValidObjectId(template) ||
            !(await Templates.findById(template))
        ) {
            return NextResponse.json({ message: 'Invalid or missing telegram fields' }, { status: 400 });
        }
    } else {
        delete body.content.telegram;
    }

    if (!type.includes('telegram')) {
        if (body.content?.telegram) delete body.content.telegram;
    }
    if (!type.includes('email')) {
        if (body.content?.email) delete body.content.email;
    }
    try {
        const adMessage = await AdMessages.create(body);
        const savedAdMessage = await AdMessages.findById(adMessage._id)
            .populate('marketingCampaign', '_id name description status startDate endDate')
            .populate('content.email.template', '_id name type')
            .populate('content.telegram.template', '_id name type');

        return NextResponse.json({
            message: 'AdMessage created successfully',
            savedAdMessage
        }, {status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Error creating AdMessage'}, {status: 500});
    }
}