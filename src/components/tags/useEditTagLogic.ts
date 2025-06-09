'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TagFormData } from '@/types/forms';
import { ITag } from '@/types/Tag';

export default function useEditTagLogic({ id, token, router }: any) {
    const form = useForm<TagFormData>({ defaultValues: { name: '', keywords: [] } });
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchTag = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/tags/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await res.json();
            if (!res.ok) {
                setApiError(result.message || 'Not found');
                setErrorOpen(true);
                return;
            }

            form.reset(result.result);
        } catch {
            setApiError('Failed to fetch tag');
            setErrorOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTag();
    }, [token]);

    const onSubmit = async (data: ITag) => {
        try {
            const res = await fetch(`/api/tags/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) {
                setErrorMessage(result.message || 'Update failed');
                setErrorOpen(true);
                return;
            }

            setSuccessOpen(true);
            setTimeout(() => router.push('/tags'), 3000);
        } catch {
            setErrorMessage('Unexpected update error');
            setErrorOpen(true);
        }
    };

    return {
        form, loading, apiError,
        successOpen, errorOpen, errorMessage,
        setSuccessOpen, setErrorOpen, setErrorMessage,
        fetchTag, onSubmit,
    };
}
