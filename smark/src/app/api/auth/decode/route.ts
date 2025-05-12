import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
    const { token } = await request.json();

    if (!token) {
        return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return NextResponse.json({ error: 'JWT_SECRET is not defined' }, { status: 500 });
    }

    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);

        return NextResponse.json({
            username: payload.username,
            role: payload.role,
            id: payload.uid,
        });
    } catch (error) {
        console.error('Failed to decode token:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}
