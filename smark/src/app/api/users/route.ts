import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectDB from '@/config/db';
import { Users, MarketingCampaigns } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();

    const allowedRoles = ['developer', 'admin'];

    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    const filter: Record<string, any> = {};

    if (searchParams.has('role')) {
      filter.role = searchParams.get('role');
    }

    if (searchParams.has('username')) {
      filter.username = { $regex: searchParams.get('username'), $options: 'i' };
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
    const total = await Users.countDocuments(filter);
    const users = await Users.find(filter).skip(skip).limit(limit)
      .populate('marketingCampaigns', '_id name description status');

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      total,
      totalPages,
      page,
      limit,
      results: users,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error fetching Users' },
      { status: 500 }
    );
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

    const requiredFields = ['username', 'password', 'role'/*, 'marketingCampaigns'*/];
    const missingFields = requiredFields.filter(
      field => body[field] === undefined || body[field] === null
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: 'Required missing fields', missingFields },
        { status: 400 }
      );
    }

    if (!['admin', 'employee'].includes(body.role)) {
      return NextResponse.json(
        { message: 'Invalid Rol. Should "admin" or "employee".' },
        { status: 400 }
      );
    }

    const existingUser = await Users.findOne({ username: body.username });
    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this name already exists' },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(body.password, 10);

    if (user.role === 'admin') {
      body.role = 'employee';
    }

    const newUser = await Users.create({
      username: body.username,
      password: hashed,
      role: body.role,
      marketingCampaigns: body.marketingCampaigns,
    });

    const savedUser = await Users.findById(newUser._id)
      .populate('marketingCampaigns', '_id name description status');

    return NextResponse.json(
      { message: 'User created successfully.', result: savedUser },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error creating user.' },
      { status: 500 }
    );
  }
}