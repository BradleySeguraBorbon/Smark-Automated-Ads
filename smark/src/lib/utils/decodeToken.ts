import Cookies from 'js-cookie';
import { useAuthStore } from '@/lib/store';

export async function decodeToken(token: string | null | undefined) {
    if (!token || token.trim() === '') {
        return handleInvalidToken();
    }

    try {
        const res = await fetch('/api/auth/decode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        if (!res.ok) {
            console.log('Error verifying token on server');
            return handleInvalidToken();
        }

        const data = await res.json();

        Cookies.set('token', token, { path: '/', expires: data.expires });
        return data;
    } catch (error) {
        console.log('Failed to decode token via API:', error);
        return handleInvalidToken();
    }
}

function handleInvalidToken() {
    Cookies.remove('token');

    const { clearAuth } = useAuthStore.getState();
    clearAuth();

    return null;
}
