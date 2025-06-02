import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';

export function useAuth() {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const setToken = useAuthStore((state) => state.setToken);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        if (!user) {
            (async () => {
                await setToken(token);
                setLoading(false);
            })();
        } else {
            setLoading(false);
        }
    }, [token, user, setToken]);

    return { token, user, loading };
}
