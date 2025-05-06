import {jwtVerify} from 'jose';

export async function decodeToken(token: string | null | undefined) {
    console.log(token);
    if (!token || token.trim() === '') {
        return null;
    }

    try {
        const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp > currentTime) {
            console.log("Token: ", token);
            console.log("User id: ", payload.id);
            return {
                username: payload.username,
                role: payload.role,
                id: payload.uid,
            };
        } else {
            return null;
        }
    } catch (error) {
        console.log("Failed to decode token: ", error);
        return null;
    }
}
