import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { Clients, Tags, AdMessages } from '@/models/models';
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

    if (searchParams.has('preferredContactMethod')) {
      filter.preferredContactMethod = searchParams.get('preferredContactMethod');
    }
    if (searchParams.has('subscription')) {
      filter.subscriptions = searchParams.get('subscription');
    }
    if (searchParams.has('tag')) {
      filter.tags = searchParams.get('tag');
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

    const total = await Clients.countDocuments(filter);
    const clients = await Clients.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('tags', 'name')
      .populate('adInteractions.adMessage', 'name status');

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      total,
      totalPages,
      page,
      limit,
      results: clients,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error fetching clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
/*
    const allowedRoles = ['developer', 'admin'];

    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }
*/
    const body = await request.json();

    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'preferredContactMethod',
      'subscriptions',
      'birthDate'
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (isNaN(Date.parse(body.birthDate))) {
      return NextResponse.json(
        { message: 'Invalid birthDate format' },
        { status: 400 }
      );
    }

    if (body.tags && body.tags.length > 0) {
      const invalidTags = await validateObjectIdsExist(body.tags, Tags, 'tags');
      if (invalidTags) {
        return NextResponse.json(
          { message: 'Invalid tag references', details: invalidTags },
          { status: 400 }
        );
      }
    }

    if (body.adInteractions && body.adInteractions.length > 0) {
      const adMessageIds = body.adInteractions.map((interaction: any) => interaction.adMessage);
      const invalidAdMessages = await validateObjectIdsExist(
        adMessageIds,
        AdMessages,
        'adInteractions'
      );
      if (invalidAdMessages) {
        return NextResponse.json(
          { message: 'Invalid ad message references', details: invalidAdMessages },
          { status: 400 }
        );
      }
    }

    const existingClient = await Clients.findOne({
      $or: [
        { email: body.email },
        { telegramChatId: body.telegramChatId }
      ]
    });

    if (existingClient) {
      return NextResponse.json(
        { message: 'Client with this email or telegram username already exists' },
        { status: 409 }
      );
    }

    const newClient = await Clients.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      telegramChatId: body.telegramChatId,
      preferredContactMethod: body.preferredContactMethod,
      subscriptions: body.subscriptions,
      birthDate: body.birthDate,
      preferences: body.preferences || [],
      tags: body.tags || [],
      adInteractions: body.adInteractions || []
    });

    return NextResponse.json(
      { message: 'Client created successfully', result: newClient },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: 'Error creating client' },
      { status: 500 }
    );
  }
}