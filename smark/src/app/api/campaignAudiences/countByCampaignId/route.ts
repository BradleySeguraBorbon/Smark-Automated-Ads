import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import CampaignAudiences from '@/models/CampaignAudience';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId || !mongoose.Types.ObjectId.isValid(campaignId)) {
        return NextResponse.json({ message: 'Invalid or missing campaignId' }, { status: 400 });
    }

    try {
        const campaignAudience = await CampaignAudiences.findOne({ campaign: campaignId }).select('audience');

        if (!campaignAudience) {
            return NextResponse.json({ message: 'CampaignAudience not found', count: 0 });
        }

        const count = campaignAudience.audience.length;

        return NextResponse.json({
            message: 'Audience count retrieved successfully',
            count,
        });
    } catch (error) {
        console.error('Error fetching audience count:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
