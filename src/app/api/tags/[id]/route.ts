import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/config/db';
import { Tags, MarketingCampaigns, Clients } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import {sanitizeRequest} from "@/lib/utils/sanitizeRequest";

function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
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
            return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
        }

        const tag = await Tags.findById(id);
        if (!tag) {
            return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Tag found', result: tag });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching tag' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();

    const allowedRoles = ['developer', 'admin'];
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
    }

    const result = await sanitizeRequest(request, {
        requiredFields: ['name', 'keywords']
    });
    if (!result.ok) return result.response;
    const body = result.data;

    if (!body.name || !Array.isArray(body.keywords) || body.keywords.length === 0) {
        return NextResponse.json({ message: 'Invalid name or keywords' }, { status: 400 });
    }

    const existing = await Tags.findOne({ name: body.name, _id: { $ne: id } });
    if (existing) {
        return NextResponse.json({ message: 'Tag name already exists' }, { status: 409 });
    }

    try {
        const updated = await Tags.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!updated) {
            return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Tag updated successfully', result: updated });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Error updating tag' }, { status: 500 });
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
            return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
        }

        await MarketingCampaigns.updateMany(
            { tags: new mongoose.Types.ObjectId(id) },
            {
                $pull: {
                    tags: new mongoose.Types.ObjectId(id)
                }
            }
        );

        await Clients.updateMany(
            { tags: new mongoose.Types.ObjectId(id) },
            {
                $pull: {
                    tags: new mongoose.Types.ObjectId(id)
                }
            }
        );

        const deleted = await Tags.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Tag deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting tag' }, { status: 500 });
    }
}
