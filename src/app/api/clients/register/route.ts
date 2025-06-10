import mongoose from "mongoose";
import {AdMessages, Clients, Tags} from "@/models/models";
import connectDB from "@/config/db";
import {NextResponse} from "next/server";
import {decryptClient, encryptClient} from '@/lib/clientEncryption';
import {sanitizeRequest} from "@/lib/utils/sanitizeRequest";

async function validateObjectIdsExist(ids: string[], model: any, fieldName: string) {
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    const foundDocs = await model.find({_id: {$in: validIds}}).select('_id');
    const foundIds = new Set(foundDocs.map((doc: any) => doc._id.toString()));
    const invalid = ids.filter(id => !foundIds.has(id));
    return invalid.length === 0 ? null : {field: fieldName, invalidIds: invalid};
}

export async function POST(request: Request) {
    await connectDB();

    const result = await sanitizeRequest(request, {
        requiredFields: [
            'firstName', 'lastName', 'email', 'phone', 'preferredContactMethod',
            'subscriptions', 'birthDate'
        ],
        dates: ['birthDate'],
        emails: ['email'],
        enums: [{ field: 'preferredContactMethod', allowed: ['email', 'telegram'] }],
        enumArrays: [{ field: 'subscriptions', allowed: ['email', 'telegram'] }]
    });

    if (!result.ok) return result.response;
    const body = result.data;

    if (!body.email && !body.telegramChatId) {
        return NextResponse.json({
            message: 'Client must have at least one contact method: email or telegramChatId.'
        }, { status: 400 });
    }

    if (body.preferredContactMethod === 'email' && !body.email) {
        return NextResponse.json({
            message: 'Preferred contact method is email, but email is missing.'
        }, { status: 400 });
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
        const invalidAdMessages = await validateObjectIdsExist(adMessageIds, AdMessages, 'adInteractions');
        if (invalidAdMessages) {
            return NextResponse.json(
                { message: 'Invalid ad message references', details: invalidAdMessages },
                { status: 400 }
            );
        }
    }

    const encrypted = encryptClient(body);

    try {
        const newClient = await Clients.create(encrypted);

        const client = await Clients.findById(newClient._id)
            .populate('tags', '_id name')
            .populate('adInteractions.adMessage', '_id name type');

        return NextResponse.json(
            { message: 'Client created successfully', result: decryptClient(client) },
            { status: 201 }
        );
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || 'Error creating client' },
            { status: error.name === 'ValidationError' ? 422 : 500 }
        );
    }
}