import { NextRequest, NextResponse } from 'next/server';
import { AdMessages } from '@/models/models';
import connectDB from '@/config/db';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        await connectDB();

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const messages = await AdMessages.find({
            status: 'programmed',
            sendDate: { $lte: endOfToday }
        });

        for (const msg of messages) {
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
