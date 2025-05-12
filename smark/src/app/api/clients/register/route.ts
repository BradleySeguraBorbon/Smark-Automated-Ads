import mongoose from "mongoose";
import {AdMessages, Clients, Tags} from "@/models/models";
import connectDB from "@/config/db";
import {NextResponse} from "next/server";

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
    const tagsString = JSON.stringify(tags.map(tag => ({id: tag._id, keywords: tag.keywords})));
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
        , {client: JSON.stringify(client), tags: tagsString});
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({prompt})
        }
    )

    const data = await response.json();

    if (!data.ok) {
        console.log("Data: ", data)
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
                {message: 'Missing required fields', missingFields},
                {status: 400}
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                {message: 'Invalid email format'},
                {status: 400}
            );
        }

        if (isNaN(Date.parse(body.birthDate))) {
            return NextResponse.json(
                {message: 'Invalid birthDate format'},
                {status: 400}
            );
        }
        if (Array.isArray(body.tags) && body.tags.length > 0) {
            const invalidTags = await validateObjectIdsExist(body.tags, Tags, 'tags');
            if (invalidTags) {
                return NextResponse.json(
                    {message: 'Invalid tag references', details: invalidTags},
                    {status: 400}
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
                    {message: 'Invalid ad message references', details: invalidAdMessages},
                    {status: 400}
                );
            }
        }

        if (Array.isArray(body.preferences) && body.preferences.length <= 0) {
            return NextResponse.json(
                {message: 'No preferences provided'},
                {status: 400}
            );
        }

        const existingClient = await Clients.findOne({
            $or: [
                {email: body.email},
                {telegramChatId: body.telegramChatId}
            ]
        });

        if (existingClient) {
            return NextResponse.json(
                {message: 'Client with this email or telegram username already exists'},
                {status: 409}
            );
        }

        let clientTags: string[] | null = null;
        let aiError: string | null = null;

        try {
            console.log("Empezar el try catch")
            const authHeader = request.headers.get('authorization');
            const token = authHeader?.split(' ')[1] || '';
            clientTags = await getTagsIdsBasedOnPreference({
                name: body.firstName,
                preferences: body.preferences,
            }, token);
        } catch (err) {
            console.error("AI error:", err);
            return NextResponse.json({error: "Error generating tags"}, {status: 500});
            //aiError = `Tags could not be generated automatically: ${err.message}`;
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

        const client = await newClient
            .populate('tags', ['_id', 'name']);

        return NextResponse.json(
            {message: 'Client created successfully', result: client, warning: aiError},
            {status: 201}
        );
    } catch
        (error: any) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                {error: error.message},
                {status: 422}
            );
        }
        return NextResponse.json(
            {error: 'Error creating client'},
            {status: 500}
        );
    }
}