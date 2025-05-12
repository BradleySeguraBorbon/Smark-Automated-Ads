import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { Clients, Tags, AdMessages } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';

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

        if (searchParams.has('preferredContactMethod')) {
            filter.preferredContactMethod = searchParams.get('preferredContactMethod');
        }
        if (searchParams.has('subscription')) {
            filter.subscriptions = { $in: [searchParams.get('subscription')] };
        }
        if (searchParams.has('tag')) {
            filter.tags = { $in: [searchParams.get('tag')] };
        }
        const tagIds = searchParams.getAll('tagIds[]');
        if (tagIds.length > 0) {
            const validTagIds = tagIds.filter(id => mongoose.Types.ObjectId.isValid(id));
            if (validTagIds.length > 0) {
                filter.tags = { $in: validTagIds };
            }
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
            .populate('tags', '_id name')
            .populate('adInteractions.adMessage', '_id name type');

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

function fillPrompt(template: string, variables: Record<string, string>) {
    return template.replace(/\${(.*?)}/g, (_, key) => {
        const value = variables[key.trim()];
        if (value === undefined) {
            throw new Error(`Missing value for template variable: ${key}`);
        }
        return value;
    });
}

function convertResponseIntoArray(response: string) {
    const cleaned = response
        .replace(/```[\s\S]*?\n/, '')
        .replace(/```/g, '')
        .trim()
        .replace(/^"+|"+$/g, '');

    const ids = cleaned.split(',').map(id => id.trim());
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
        console.warn('No valid ObjectIds found in AI response:', response);
    }
    return validIds;
}

async function getTagsIdsBasedOnPreference(client: { name: string, preferences: string[] }, token: string) {
    const tags = await Tags.find();
    if (tags.length === 0) {
        throw new Error("No tags found");
    }
    const tagsString = JSON.stringify(tags.map(tag => ({ id: tag._id, keywords: tag.keywords })));
    const prompt = fillPrompt(`Te proporciono la información de un cliente y una lista de tags (cada una con su ID, nombre y keywords).

1. Analiza las preferencias del cliente.
2. Relaciona esas preferencias con las keywords de las tags (busca coincidencias directas o sinónimos).
3. Devuelve SOLO la lista de _id de las tags que mejor coincidan, separados por comas.

NO des explicaciones adicionales ni otro formato!!

Si ninguna tag coincide, devuelve un string vacío.

Cliente:
\${client}

Tags disponibles (array de objetos):
\${tags}
`
        , { client: JSON.stringify(client), tags: tagsString });
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/chat/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt })
    }
    )

    const data = await response.json();

    if (!data.ok) {
        throw new Error('Error fetching tags from AI');
    }

    return convertResponseIntoArray(data.response);
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
        if (Array.isArray(body.tags) && body.tags.length > 0) {
            const invalidTags = await validateObjectIdsExist(body.tags, Tags, 'tags');
            if (invalidTags) {
                return NextResponse.json(
                    { message: 'Invalid tag references', details: invalidTags },
                    { status: 400 }
                );
            }
        }

        if (Array.isArray(body.adInteractions) && body.adInteractions.length > 0) {
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

        if (Array.isArray(body.preferences) && body.preferences.length <= 0) {
            return NextResponse.json(
                { message: 'No preferences provided' },
                { status: 400 }
            );
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

        let clientTags: string[] | null = null;

        try {
            const authHeader = request.headers.get('authorization');
            const token = authHeader?.split(' ')[1] || '';
            clientTags = await getTagsIdsBasedOnPreference({
                name: body.firstName,
                preferences: body.preferences,
            }, token);
        } catch (err) {
            console.error("AI error:", err);
            return NextResponse.json({error: "Error generating tags"}, {status: 500});
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
            tags: clientTags || [],
            adInteractions: body.adInteractions || []
        });

        const client = await Clients.findById(newClient._id)
            .populate('tags', '_id name')
            .populate('adInteractions.adMessage', '_id name type');

        return NextResponse.json(
            { message: 'Client created successfully', result: client},
            { status: 201 }
        );
    } catch
    (error: any) {
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