import { jwtVerify } from 'jose';

export async function getUserFromToken(request: Request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) throw new Error('No token available');

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);
    return payload;
}