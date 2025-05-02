import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { CampaignAudiences, Clients } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function validateObjectIdsExist(ids: string[], model: any, fieldName: string) {
  const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
  const foundDocs = await model.find({ _id: { $in: validIds } }).select('_id');
  const foundIds = new Set(foundDocs.map((doc: any) => doc._id.toString()));
  const invalid = ids.filter(id => !foundIds.has(id));
  return invalid.length === 0 ? null : { field: fieldName, invalidIds: invalid };
}

export async function GET(request: Request) {
    try {
        await connectDB();

        const allowedRoles = ['developer', 'admin', 'employee'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

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

        const allowedRoles = ['developer', 'admin'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const body = await request.json();

        const { campaign, audience, status } = body;

        if (!campaign || !Array.isArray(audience) || audience.length === 0 || !status) {
            return NextResponse.json({
                message: 'Missing required fields',
                required: ['campaign', 'audience (array)', 'status']
            }, { status: 400 });
        }

        if (!isValidObjectId(campaign)) {
            return NextResponse.json({ message: 'Invalid campaign ID' }, { status: 400 });
        }

        const audienceValidation = await validateObjectIdsExist(audience, Clients, 'audience');
        if (audienceValidation) {
            return NextResponse.json({ message: `Invalid ${audienceValidation.field} IDs`, invalidIds: audienceValidation.invalidIds }, { status: 400 });
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
