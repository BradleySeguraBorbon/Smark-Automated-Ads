import {NextResponse} from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { Tags, Users, MarketingCampaigns } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import { sanitizeRequest } from "@/lib/utils/sanitizeRequest";
import { CampaignAudiences } from '@/models/models';
import { ICampaignAudience } from "@/types/CampaignAudience"


async function validateObjectIdsExist(ids: string[], model: any, fieldName: string) {
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    const foundDocs = await model.find({_id: {$in: validIds}}).select('_id');
    const foundIds = new Set(foundDocs.map((doc: any) => doc._id.toString()));
    const invalid = ids.filter(id => !foundIds.has(id));
    return invalid.length === 0 ? null : {field: fieldName, invalidIds: invalid};
}

export async function GET(request: Request) {
    try {
        await connectDB();

        const allowedRoles = ['developer', 'admin', 'employee'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({error: 'Forbidden: insufficient permissions'}, {status: 403});
        }

        const {searchParams} = new URL(request.url);

        const filter: Record<string, any> = {};

        if (searchParams.has('assignedTo')) {
            const userId = searchParams.get('assignedTo');
            if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                filter.users = userId;
            } else {
                return NextResponse.json({error: 'Invalid user ID format'}, {status: 400});
            }
        }
        if (searchParams.has('name')) {
            const name = searchParams.get('name');
            filter.name = { $regex: name, $options: 'i' };
        }

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return NextResponse.json(
                {message: 'Invalid parameters: page and limit should be greater than 0.'}, {status: 400}
            );
        }

        const skip = (page - 1) * limit;

        const total = await MarketingCampaigns.countDocuments(filter);
        const campaigns = await MarketingCampaigns.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('tags', '_id name')
            .populate('users', '_id username role')
            .lean();

        const enrichedCampaigns = await Promise.all(
            campaigns.map(async (c) => {
                const audienceDoc = await CampaignAudiences.findOne({ campaign: c._id }).lean<ICampaignAudience>();
                const count = audienceDoc?.audience?.length || 0;
                return { ...c, audienceCount: count };
            })
        );

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            totalPages,
            page,
            limit,
            results: enrichedCampaigns,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Error fetching marketing campaigns'}, {status: 500});
    }
}

export async function POST(request: Request) {
    await connectDB();

    const allowedRoles = ['developer', 'admin'];
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({error: 'Forbidden: insufficient permissions'}, {status: 403});
    }

    const result = await sanitizeRequest(request, {
        requiredFields: ['name', 'description', 'startDate', 'endDate', 'tags'],
        dates: ['startDate', 'endDate'],
        enums: [{field: 'status', allowed: ['active', 'inactive', 'completed']}]
    });
    if (!result.ok) return result.response;
    const body = result.data;

    if (new Date(body.endDate) <= new Date(body.startDate)) {
        return NextResponse.json({message: 'End date must be after start date'}, {status: 400});
    }

    const tags = body.tags;
    const userIds = body.users || [];

    const [invalidTags, invalidUsers] = await Promise.all([
        validateObjectIdsExist(tags, Tags, 'tags'),
        validateObjectIdsExist(userIds, Users, 'users'),
    ]);

    const invalidRefs = [invalidTags, invalidUsers].filter(Boolean);
    if (invalidRefs.length > 0) {
        return NextResponse.json({
            message: 'Invalid references found in request',
            details: invalidRefs
        }, {status: 400});
    }

    const existingCampaign = await MarketingCampaigns.findOne({name: body.name});
    if (existingCampaign) {
        return NextResponse.json(
            {message: 'A campaign with this name already exists'},
            {status: 409}
        );
    }

    try {
        const newCampaign = await MarketingCampaigns.create({
            name: body.name,
            description: body.description,
            status: body.status || 'inactive',
            startDate: body.startDate,
            endDate: body.endDate,
            tags: body.tags,
            users: body.users || [],
            performance: {
                totalEmailsSent: 0,
                totalEmailsOpened: 0,
                telegramMessagesSent: 0,
                telegramMessagesOpened: 0
            },
            isAiGenerated: body.isAiGenerated || false
        });

        const campaign = await MarketingCampaigns.findById(newCampaign._id)
            .populate('tags', '_id name')
            .populate('users', '_id username role');

        return NextResponse.json(
            {message: 'Marketing campaign created successfully', result: campaign},
            {status: 201}
        );
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            {error: error.message || 'Error creating marketing campaign'},
            {status: 500}
        );
    }
}