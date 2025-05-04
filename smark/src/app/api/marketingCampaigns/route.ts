import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { Tags, Users, Clients, MarketingCampaigns } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';

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

    const filter: Record<string, any> = {};

    if (searchParams.has('status')) {
      filter.status = searchParams.get('status');
    }
    if (searchParams.has('startDate')) {
      filter.startDate = { $gte: new Date(searchParams.get('startDate') as string) };
    }
    if (searchParams.has('endDate')) {
      filter.endDate = { $lte: new Date(searchParams.get('endDate') as string) };
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { message: 'Invalid parameters: page and limit should be greater than 0.' }, { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const total = await MarketingCampaigns.countDocuments(filter);
    const campaigns = await MarketingCampaigns.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('tags.tag', '_id name')
      .populate('audiencePreview', '_id email firstName lastName')
      .populate('users', '_id username role');

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({    
      totalPages,
      page,
      limit,
      results: campaigns,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching marketing campaigns' }, { status: 500 });
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

    const requiredFields = [
      'name',
      'description',
      'startDate',
      'endDate',
      'tags'
    ];

    const missingFields = requiredFields.filter(
      field => body[field] === undefined || body[field] === null
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: 'Missing required fields', missingFields },
        { status: 400 }
      );
    }

    if (isNaN(Date.parse(body.startDate))) {
      return NextResponse.json(
        { message: 'Invalid startDate format' },
        { status: 400 }
      );
    }

    if (isNaN(Date.parse(body.endDate))) {
      return NextResponse.json(
        { message: 'Invalid endDate format' },
        { status: 400 }
      );
    }

    if (new Date(body.endDate) <= new Date(body.startDate)) {
      return NextResponse.json(
        { message: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const tags = body.tags.map((tag: any) => tag.tag);
    const audienceIds = body.audiencePreview || [];
    const userIds = body.users || [];

    const [invalidTags, invalidAudience, invalidUsers] = await Promise.all([
      validateObjectIdsExist(tags, Tags, 'tags'),
      validateObjectIdsExist(audienceIds, Clients, 'audiencePreview'),
      validateObjectIdsExist(userIds, Users, 'users'),
    ]);

    const invalidRefs = [invalidTags, invalidAudience, invalidUsers].filter(Boolean);
    if (invalidRefs.length > 0) {
      return NextResponse.json({
        message: 'Invalid references found in request',
        details: invalidRefs
      }, { status: 400 });
    }

    const existingCampaign = await MarketingCampaigns.findOne({ name: body.name });
    if (existingCampaign) {
      return NextResponse.json(
        { message: 'A campaign with this name already exists' },
        { status: 409 }
      );
    }

    const newCampaign = await MarketingCampaigns.create({
      name: body.name,
      description: body.description,
      status: body.status || 'inactive',
      startDate: body.startDate,
      endDate: body.endDate,
      tags: body.tags,
      audiencePreview: body.audiencePreview || [],
      users: body.users || [],
      performance: {
        totalEmailsSent: 0,
        totalEmailsOpened: 0,
        telegramMessagesSent: 0,
        telegramMessagesOpened: 0
      }
    });

    const campaign = await newCampaign
    .populate('tags.tag', '_id name')
    .populate('audiencePreview', '_id email firstName lastName')
    .populate('users', '_id username role');

    return NextResponse.json(
      { message: 'Marketing campaign created successfully', result: campaign },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error creating marketing campaign' },
      { status: 500 }
    );
  }
}