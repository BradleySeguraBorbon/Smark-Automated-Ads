import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { AdMessages } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const allowedRoles = ['admin', 'developer', 'employee'];
        if (!allowedRoles.includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
        }

        const { id } = await params;
        const campaignId =  id;
        if (!mongoose.Types.ObjectId.isValid(campaignId)) {
            return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
        }

        // Conteo real de mensajes según tipo y estado
        const [emailSent, emailDraft, telegramSent, telegramDraft] = await Promise.all([
            AdMessages.countDocuments({ marketingCampaign: campaignId, type: 'email', status: 'sent' }),
            AdMessages.countDocuments({ marketingCampaign: campaignId, type: 'email', status: 'draft' }),
            AdMessages.countDocuments({ marketingCampaign: campaignId, type: 'telegram', status: 'sent' }),
            AdMessages.countDocuments({ marketingCampaign: campaignId, type: 'telegram', status: 'draft' }),
        ]);

        const emailTotal = emailSent + emailDraft;
        const telegramTotal = telegramSent + telegramDraft;
        const totalSent = emailSent + telegramSent;
        const totalDraft = emailDraft + telegramDraft;
        const total = totalSent + totalDraft;

        return NextResponse.json({
            email: {
                sent: emailSent,
                draft: emailDraft,
                total: emailTotal
            },
            telegram: {
                sent: telegramSent,
                draft: telegramDraft,
                total: telegramTotal
            },
            general: {
                sent: totalSent,
                draft: totalDraft,
                total: total
            }
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
