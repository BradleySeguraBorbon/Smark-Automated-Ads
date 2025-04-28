import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { Tags } from '@/models/models';
import { getUserFromToken } from '@/../lib/auth';

export async function GET(request: Request) {
    try {
        await connectDB();

        const user = await getUserFromToken(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allowedRoles = ['admin', 'developer', 'employee'];

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (searchParams.has('name')) {
            filter.name = searchParams.get('name');
        }

        if (searchParams.has('keywords')) {
            const keywords = searchParams.getAll('keywords');
            filter.keywords = { $in: keywords };
        }

        const total = await Tags.countDocuments(filter);
        const tags = await Tags.find(filter).skip(skip).limit(limit);

        if (tags.length === 0) {
            return NextResponse.json({ message: 'No tags found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Tags fetched successfully',
            results: tags,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching paginated tags' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();

        const user = await getUserFromToken(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allowedRoles = ['admin', 'developer'];

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const body = await request.json();

        const requiredFields = [
            'name',
            'keywords'
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

        if (!body.name || !Array.isArray(body.keywords) || body.keywords.length === 0) {
            return NextResponse.json({ message: 'Name and keywords are required' }, { status: 400 });
        }

        const exists = await Tags.findOne({ name: body.name });
        if (exists) {
            return NextResponse.json({ message: 'Tag with this name already exists' }, { status: 409 });
        }

        const newTag = await Tags.create(body);
        return NextResponse.json({ message: 'Tag created successfully', result: newTag }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating tag' },
            { status: 500 });
    }
}