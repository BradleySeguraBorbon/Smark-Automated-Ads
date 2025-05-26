import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { Clients, AdMessages, Tags } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import {decryptClient} from "@/lib/clientEncryption";

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

        const body = await request.json();

        if (body.birthDate) {
            body.birthDate = new Date(body.birthDate);
        }

        if (body.birthDate && isNaN(Date.parse(body.birthDate))) {
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

        const updatedClient = await Clients.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        )
            .populate('tags', '_id name')
            .populate('adInteractions.adMessage', '_id name type');

        if (!updatedClient) {
            return NextResponse.json(
                { message: 'Client not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Client updated successfully',
            result: updatedClient,
        });
    } catch (error: any) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { error: error.message },
                { status: 422 }
            );
        }
        return NextResponse.json(
            { error: 'Error updating client' },
            { status: 500 }
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