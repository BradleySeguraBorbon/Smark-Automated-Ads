import { NextResponse } from 'next/server';
import { jwtVerify, JWTVerifyResult } from 'jose';

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
        const { payload }: JWTVerifyResult = await jwtVerify(token, secret);

        return NextResponse.json({
            username: payload.username,
            role: payload.role,
            expires: payload.exp,
            id: payload.uid,
            email: payload.email,
            code: payload.code,
            purpose: payload.purpose,
        });
    } catch (error: any) {
        if (error?.code === 'ERR_JWT_EXPIRED') {
            console.warn('Token expired:', error); // log opcional
            return NextResponse.json({ error: 'TokenExpired' }, { status: 401 });
        }

        console.error('Token decode failed:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}
