import { jwtVerify } from 'jose';

export async function getUserFromToken(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) throw new Error('No token available');

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) { 
        return null;
    }
}

export function getUserFromRequest(request: Request) {
    const username = request.headers.get('x-username');
    const userRole = request.headers.get('x-user-role');

    if (!username || !userRole) {
        return null;
    }

    return { username: username, role: userRole };
}
