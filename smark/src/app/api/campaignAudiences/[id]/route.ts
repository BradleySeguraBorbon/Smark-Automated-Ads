import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/config/db';
import { CampaignAudiences } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';

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

        if (!isValidObjectId(id)) {
            return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
        }

        const campaignAudience = await CampaignAudiences.findById(id)
            .populate('campaign', ['_id', 'name', 'description', 'status'])
            .populate('audience', ['_id', 'email', 'firstName', 'lastName']);

        if (!campaignAudience) {
            return NextResponse.json({ message: 'Campaign audience not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Campaign audience found', result: campaignAudience });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching campaign audience' }, { status: 500 });
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
            return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
        }

        const body = await request.json();
        const { campaign, audience, status } = body;

        const requiredFields = ['campaign', 'audience', 'status'];
        const missingFields = requiredFields.filter(
            field => body[field] === undefined || body[field] === null
        );

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: 'Missing required fields', missingFields },
                { status: 400 }
            );
        }

        if (!isValidObjectId(campaign)) {
            return NextResponse.json({ message: 'Invalid campaign ID' }, { status: 400 });
        }

        const audienceValidation = await validateObjectIdsExist(audience, CampaignAudiences, 'audience');
        if (audienceValidation) {
            return NextResponse.json({ message: `Invalid ${audienceValidation.field} IDs`, invalidIds: audienceValidation.invalidIds }, { status: 400 });
        }

        const validStatuses = ['approved', 'pending', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const updatedCampaignAudience = await CampaignAudiences.findByIdAndUpdate(
            id,
            { campaign, audience, status },
            { new: true, runValidators: true }
        );

        if (!updatedCampaignAudience) {
            return NextResponse.json({ message: 'Campaign audience not found' }, { status: 404 });
        }

        const campaignAudience = await updatedCampaignAudience
            .populate('campaign', ['_id', 'name', 'description', 'status'])
            .populate('audience', ['_id', 'email', 'firstName', 'lastName'])

        return NextResponse.json({ message: 'Campaign audience updated successfully', result: campaignAudience });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || 'Error updating campaign audience' },
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

        if (!isValidObjectId(id)) {
            return NextResponse.json({ message: 'Invalid or missing ID' }, { status: 400 });
        }

        const deleted = await CampaignAudiences.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ message: 'Campaign audience not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Campaign audience deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting campaign audience' }, { status: 500 });
    }
}
