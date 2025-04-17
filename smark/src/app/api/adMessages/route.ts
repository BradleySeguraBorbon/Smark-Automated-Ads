import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { MarketingCampaigns, AdMessages, Templates } from '@/models/models';

function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '5');

        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return NextResponse.json(
                { message: 'Invalid parameters: page y limit should be greater than 0.' },
                { status: 400 }
            );
        }

        const skip = (page - 1) * limit;

        const total = await AdMessages.countDocuments();
        const adMessage = await AdMessages.find().skip(skip).limit(limit)
            .populate('marketingCampaign', ['name', 'description', 'status'])
            .populate('template', ['name', 'type']);

        if (adMessage.length === 0) {
            return NextResponse.json({ message: 'No AdMessages found' }, { status: 404 });
        }

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            totalPages,
            page,
            limit,
            result: adMessage,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error getting AdMessages' }, { status: 500 });
    }

}

export async function POST(request: Request) {

    try {
        await connectDB();
        const body = await request.json();

        const requiredFields = [
            'name',
            'marketingCampaign',
            'type',
            'status',
            'content',
            'attachments',
            'template',
            'sendDate'
        ];

        const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);

        const { name, marketingCampaign, type, status, content, attachments, template, sendDate } = body;

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields.`, missingFields },
                { status: 400 }
            );
        }

        if (isNaN(Date.parse(sendDate))) {
            return NextResponse.json({ message: 'Invalid sendDate format' }, { status: 400 });
        }

        if (!isValidObjectId(marketingCampaign) || !(await MarketingCampaigns.findById(marketingCampaign))) {
            return NextResponse.json({ message: 'Invalid or non-existent marketingCampaign' }, { status: 400 });
        }

        if (!isValidObjectId(template) || !(await Templates.findById(template))) {
            return NextResponse.json({ message: 'Invalid or non-existent template' }, { status: 400 });
        }

        const adMessage = new AdMessages({
            name,
            marketingCampaign,
            type,
            status,
            content,
            attachments,
            template,
            sendDate,
        });

        await adMessage.save();
        return NextResponse.json({ message: 'AdMessage created successfully', adMessage },
            { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Error creating AdMessage' }, { status: 500 }
        );
    }

}