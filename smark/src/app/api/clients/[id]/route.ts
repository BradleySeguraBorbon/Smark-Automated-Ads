import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { Clients, AdMessages, Tags } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import {decryptClient,encryptClient} from "@/lib/clientEncryption";
import {sanitizeRequest} from "@/lib/utils/sanitizeRequest";

function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

async function validateObjectIdsExist(ids: string[], model: any, fieldName: string) {
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    const foundDocs = await model.find({ _id: { $in: validIds } }).select('_id');
    const foundIds = new Set(foundDocs.map((doc: any) => doc._id.toString()));
    const invalid = ids.filter(id => !foundIds.has(id));
    return invalid.length === 0 ? null : { field: fieldName, invalidIds: invalid };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const allowedRoles = ['developer', 'admin', 'employee'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { id } = await params;

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json(
                { message: 'Invalid or missing ID parameter' },
                { status: 400 }
            );
        }

        const client = await Clients.findById(id)
            .populate('tags', '_id name')
            .populate('adInteractions.adMessage', '_id name type');

        if (!client) {
            return NextResponse.json(
                { message: 'Client not found' },
                { status: 404 }
            );
        }

        const decrypted = decryptClient(client);
        return NextResponse.json({
            message: 'Client found',
            result: decrypted,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Error fetching client' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();

    const allowedRoles = ['developer', 'admin'];
    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowedRoles.includes(user.role as string)) {
        return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    if (!id || !isValidObjectId(id)) {
        return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
    }

    const result = await sanitizeRequest(request, {
        requiredFields: [
            'firstName', 'lastName', 'email', 'phone', 'preferredContactMethod',
            'subscriptions', 'birthDate', 'telegramChatId'
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

    if (body.preferredContactMethod === 'telegram' && !body.telegramChatId) {
        return NextResponse.json({
            message: 'Preferred contact method is telegram, but telegramChatId is missing.'
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
        const updatedClient = await Clients.findByIdAndUpdate(id, encrypted, { new: true, runValidators: true })
            .populate('tags', '_id name')
            .populate('adInteractions.adMessage', '_id name type');

        if (!updatedClient) {
            return NextResponse.json({ message: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Client updated successfully',
            result: decryptClient(updatedClient),
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || 'Error updating client' },
            { status: error.name === 'ValidationError' ? 422 : 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const allowedRoles = ['developer', 'admin'];

        const user = getUserFromRequest(request);

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(user.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { id } = await params;

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json(
                { message: 'Invalid or missing ID parameter' },
                { status: 400 }
            );
        }

        const deletedClient = await Clients.findByIdAndDelete(id);

        if (!deletedClient) {
            return NextResponse.json(
                { message: 'Client not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Client deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Error deleting client' },
            { status: 500 }
        );
    }
}