import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { CampaignAudiences } from '@/models/models';

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (searchParams.has('status')) {
            filter.status = searchParams.get('status');
        }

        if (searchParams.has('campaignId')) {
            filter.campaign = searchParams.get('campaignId');
        }

        const total = await CampaignAudiences.countDocuments(filter);
        const results = await CampaignAudiences.find(filter)
            .populate('campaign')
            .populate('audience')
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            message: 'Campaign audiences fetched successfully',
            results,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching campaign audiences' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();

        const { campaign, audience, status } = body;

        if (!campaign || !Array.isArray(audience) || audience.length === 0 || !status) {
            return NextResponse.json({
                message: 'Missing required fields',
                required: ['campaign', 'audience (array)', 'status']
            }, { status: 400 });
        }

        const validStatuses = ['approved', 'pending', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({
                message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
            }, { status: 400 });
        }

        const newAudience = await CampaignAudiences.create({ campaign, audience, status });

        return NextResponse.json({
            message: 'Campaign audience created successfully',
            result: newAudience
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating campaign audience' }, { status: 500 });
    }
}
