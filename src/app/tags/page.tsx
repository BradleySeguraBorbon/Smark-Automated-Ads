'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { decodeToken } from '@/lib/utils/decodeToken';
import useTagsData from '@/components/tags/useTagsData';
import TagsPageLayout from '@/components/tags/TagsPageLayout';

export default function TagsPage() {
    const router = useRouter();
    const token = useAuthStore((s) => s.token);
    const hydrated = useAuthStore((s) => s._hasHydrated);
    const {
        tags, currentPage, totalPages, loading, apiError,
        successOpen, successMessage, searchTerm,
        setSearchTerm, setCurrentPage,
        setSuccessOpen, setSuccessMessage,
        userRole, fetchTags
    } = useTagsData();

    useEffect(() => {
        if (!hydrated) return;
        if (!token) {
            router.push('/auth/login');
            return;
        }

        decodeToken(token).then((user) => {
            if (!user) {
                router.push('/auth/login');
                return;
            }

            fetchTags(currentPage);
        });
    }, [hydrated, token, currentPage, searchTerm]);

    return (
        <TagsPageLayout
            tags={tags}
            currentPage={currentPage}
            totalPages={totalPages}
            loading={loading}
            apiError={apiError}
            userRole={userRole}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setCurrentPage={setCurrentPage}
            successOpen={successOpen}
            successMessage={successMessage}
            setSuccessOpen={setSuccessOpen}
            setSuccessMessage={setSuccessMessage}
            onRefresh={() => fetchTags(currentPage)}
        />
    );
}
