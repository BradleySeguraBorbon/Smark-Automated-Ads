import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/config/db';
import { CampaignAudiences, Clients } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import { sanitizeRequest } from '@/lib/utils/sanitizeRequest';

function isValidObjectId(id: string) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();

    const allowedRoles = ['developer', 'admin'];
    const user = getUserFromRequest(request);

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { id: campaignId } = await params;
    if (!isValidObjectId(campaignId)) {
        return NextResponse.json({ message: 'Invalid campaign ID' }, { status: 400 });
    }

    const result = await sanitizeRequest(request, {
        requiredFields: ['audience', 'status'],
        enums: [{ field: 'status', allowed: ['approved', 'pending', 'rejected'] }]
    });

    if (!result.ok) return result.response;
    const { audience, status } = result.data;

    try {
        const updated = await CampaignAudiences.findOneAndUpdate(
            { campaign: campaignId },
            { audience, status },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json({ message: 'CampaignAudience not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'CampaignAudience updated successfully',
            result: updated
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || 'Error updating CampaignAudience' },
            { status: 500 }
        );
    }
}
