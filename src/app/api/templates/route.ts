import {NextResponse} from 'next/server';
import connectDB from '@/config/db';
import Templates from '@/models/Template';
import {getUserFromRequest} from '@/lib/auth';
import {sanitizeRequest} from "@/lib/utils/sanitizeRequest";

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
        if (searchParams.has('type')) {
            filter.type = searchParams.get('type');
        }

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return NextResponse.json(
                {message: 'Invalid parameters: page and limit should be greater than 0.'},
                {status: 400}
            );
        }

        const skip = (page - 1) * limit;

        const [templates, total] = await Promise.all([
            Templates.find(filter).skip(skip).limit(limit),
            Templates.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            total,
            totalPages,
            page,
            limit,
            results: templates,
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            {error: 'Error fetching templates'},
            {status: 500}
        );
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
        requiredFields: ['name', 'type', 'html'],
        enums: [{field: 'type', allowed: ['email', 'telegram']}]
    });
    if (!result.ok) return result.response;
    const body = result.data;

    const exists = await Templates.findOne({name: body.name});
    if (exists) {
        return NextResponse.json({message: 'Template with this name already exists'}, {status: 409});
    }

    try {
        const newTemplate = await Templates.create(body);
        return NextResponse.json({message: 'Template created successfully', result: newTemplate}, {status: 201});
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({error: error.message || 'Error creating template'}, {status: 500});
    }
}