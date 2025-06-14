'use client';

import { useState } from 'react';
import { ITag } from '@/types/Tag';
import { useAuthStore } from '@/lib/store';

export default function useTagsData() {
    const [tags, setTags] = useState<ITag[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [userRole, setUserRole] = useState('guest');
    const token = useAuthStore.getState().token;

    const fetchTags = async (page: number = 1) => {
        try {
            setLoading(true);

            const q = new URLSearchParams({ page: `${page}`, limit: '12' });
            if (searchTerm.trim()) q.set('name', searchTerm);

            const res = await fetch(`/api/tags?${q.toString()}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await res.json();
            if (!res.ok) {
                setApiError(result.message || result.error || 'Unknown error');
                return;
            }

            setTags(result.results);
            setTotalPages(result.totalPages);
            setApiError(null);
        } catch {
            setApiError('Could not fetch tags');
        } finally {
            setLoading(false);
        }
    };

    return {
        tags, currentPage, totalPages, loading, apiError,
        successOpen, successMessage, searchTerm,
        setSearchTerm, setCurrentPage,
        setSuccessOpen, setSuccessMessage,
        userRole, setUserRole, fetchTags,
    };
}
