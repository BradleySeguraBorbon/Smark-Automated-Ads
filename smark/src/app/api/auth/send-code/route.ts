import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import sendMail from '@/lib/utils/mailer'; // Debes tener esto implementado
import dbConnect from '@/config/db';
import User from '@/models/User';

export async function POST(request: Request) {
    await dbConnect();
    const { email, purpose } = await request.json();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await sendMail(
        email,
        'Your login code',
        `Your code is: ${code}`,
    );

    const tempToken = jwt.sign(
        {
            code,
            email,
            purpose,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '10m' }
    );

    return NextResponse.json({ tempToken });
}
