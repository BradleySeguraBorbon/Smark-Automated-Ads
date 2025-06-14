import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { Tags } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import { sanitizeRequest } from "@/lib/utils/sanitizeRequest";

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
        const getAll = searchParams.get('all') === 'true';

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (searchParams.has('name')) {
            filter.name = { $regex: searchParams.get('name') as string, $options: 'i' };
        }

        if (searchParams.has('keywords')) {
            const keywords = searchParams.getAll('keywords');
            filter.keywords = { $in: keywords };
        }

        const total = await Tags.countDocuments(filter);
        const tags = await Tags.find(filter).skip(skip).limit(limit);

        return NextResponse.json({
            message: 'Tags fetched successfully',
            results: tags,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching paginated tags' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await connectDB();

    const allowedRoles = ['developer', 'admin'];
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const result = await sanitizeRequest(request, {
        requiredFields: ['name', 'keywords']
    });
    if (!result.ok) return result.response;
    const body = result.data;

    if (!body.name || !Array.isArray(body.keywords) || body.keywords.length === 0) {
        return NextResponse.json({ message: 'Name and keywords are required' }, { status: 400 });
    }

    const exists = await Tags.findOne({ name: body.name });
    if (exists) {
        return NextResponse.json({ message: 'Tag with this name already exists' }, { status: 409 });
    }

    try {
        const newTag = await Tags.create(body);
        return NextResponse.json({ message: 'Tag created successfully', result: newTag }, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Error creating tag' }, { status: 500 });
    }
}
