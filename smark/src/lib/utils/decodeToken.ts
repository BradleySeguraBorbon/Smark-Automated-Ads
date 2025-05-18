import Cookies from 'js-cookie';
import { useAuthStore } from '@/lib/store';

export async function decodeToken(token: string | null | undefined) {
    console.log('Token recibido:', token);
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
            console.error('Error verificando el token en el servidor');
            return handleInvalidToken();
        }

        const data = await res.json();
        console.log('Token decodificado en servidor:', data);
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
