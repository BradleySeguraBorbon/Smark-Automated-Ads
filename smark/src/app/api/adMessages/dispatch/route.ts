import { NextRequest, NextResponse } from 'next/server';
import { AdMessages } from '@/models/models';
import connectDB from '@/config/db';

export async function GET() {
    try {
        await connectDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const messages = await AdMessages.find({
            status: 'programmed',
            sendDate: today,
        });

        for (const msg of messages) {
            if (msg.sendDate < new Date()) {
                msg.status = 'draft';
                await msg.save();
                continue;
            }
            try {
                await fetch(`${process.env.APP_URL}/api/email/sendAds`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adMessageId: msg._id }),
                });

                await fetch(`${process.env.APP_URL}/api/telegram/sendAds`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adMessageId: msg._id }),
                });

                msg.status = 'sent';
                await msg.save();
            } catch (err) {
                console.error(`Error dispatching message ${msg._id}:`, err);
            }
        }

        return NextResponse.json({
            message: 'Dispatch completed',
            total: messages.length,
        });
    } catch (err) {
        console.error('Dispatch error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
