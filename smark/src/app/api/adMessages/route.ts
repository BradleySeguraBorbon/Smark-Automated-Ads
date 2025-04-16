import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { MarketingCampaigns, AdMessages, Templates } from '@/models/models';

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const filter: Record<string, any> = {};

        if (searchParams.has('status')) {
            filter.status = searchParams.get('status');
        }

        if (searchParams.has('type')) {
            filter.type = searchParams.getAll('type');
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
        const adMessages = await AdMessages.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('marketingCampaignId', 'name description status')
            .populate('templateId', 'name type');

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
        const body = await request.json();

        const requiredFields = [
            'name',
            'marketingCampaignId',
            'type',
            'status',
            'content',
            'sendDate'
        ];

        const missingFields = requiredFields.filter(
            field => body[field] === undefined || body[field] === null
        );

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields.`, missingFields },
                { status: 400 }
            );
        }

        if (isNaN(Date.parse(body.sendDate))) {
            return NextResponse.json({ message: 'Invalid sendDate format' }, { status: 400 });
        }

        const newAdMessage = await AdMessages.create({
            name: body.name,
            marketingCampaignId: body.marketingCampaignId,
            type: body.type,
            status: body.status,
            content: body.content,
            attachments: body.attachments || [],
            templateId: body.templateId || null,
            sendDate: body.sendDate
        });

        await newAdMessage.save();
        return NextResponse.json({ message: 'AdMessage created successfully', newAdMessage },
            { status: 201 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Error creating AdMessage' }, { status: 500 }
        );
    }

}