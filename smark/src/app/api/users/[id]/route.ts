import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import mongoose from 'mongoose';
import { Users, MarketingCampaigns } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
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

        const allowedRoles = ['developer', 'admin'];

        const tokenUser = getUserFromRequest(request);
        if (!tokenUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(tokenUser.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { id } = await params;

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json(
                { message: 'Invalid or missing ID parameter' },
                { status: 400 }
            );
        }

        const user = await Users.findById(id).populate('marketingCampaigns', ['_id', 'name', 'description', 'status']);

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'User found',
            result: user,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Error fetching user' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['developer', 'admin'].includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    if (!id || !isValidObjectId(id)) {
        return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
    }

    const result = await sanitizeRequest(request, {
        requiredFields: ['username', 'email', 'role'],
        emails: ['email'],
        enums: [{ field: 'role', allowed: ['admin', 'employee', 'developer'] }]
    });
    if (!result.ok) return result.response;
    const body = result.data;

    const existingUser = await Users.findOne({ username: body.username, _id: { $ne: id } });
    if (existingUser) {
        return NextResponse.json({ message: 'A user with this username already exists' }, { status: 409 });
    }

    const existingEmailUser = await Users.findOne({ email: body.email, _id: { $ne: id } });
    if (existingEmailUser) {
        return NextResponse.json({ message: 'A user with this email already exists' }, { status: 409 });
    }

    if (Array.isArray(body.marketingCampaigns)) {
        const invalidRefs = await validateObjectIdsExist(body.marketingCampaigns, MarketingCampaigns, 'marketingCampaigns');
        if (invalidRefs) {
            return NextResponse.json({ message: 'Invalid campaign references', details: invalidRefs }, { status: 400 });
        }
    }

    try {
        const updatedUser = await Users.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        ).populate('marketingCampaigns', ['_id', 'name', 'description', 'status']);

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully', result: updatedUser });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || 'Error updating user' },
            { status: error.name === 'ValidationError' ? 422 : 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const allowedRoles = ['developer', 'admin'];

        const tokenUser = getUserFromRequest(request);

        if (!tokenUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!allowedRoles.includes(tokenUser.role as string)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { id } = await params;

        if (!id || !isValidObjectId(id)) {
            return NextResponse.json(
                { message: 'Invalid or missing ID parameter' },
                { status: 400 }
            );
        }

        const deletedUser = await Users.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        await MarketingCampaigns.updateMany(
            { users: id },
            { $pull: { users: id } }
          );

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Transaction error:', error);
        return NextResponse.json(
            { error: error.message || 'Error deleting user' },
            { status: 500 }
        );
    }
}
