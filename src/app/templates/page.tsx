'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import BreadcrumbHeader from '@/components/BreadcrumbHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import { useAuthStore } from '@/lib/store';
import { decodeToken } from '@/lib/utils/decodeToken';
import { ITemplate } from '@/types/Template';
import TemplateTable from '@/components/templates/TemplateTable';
import SearchInput from '@/components/SearchInput';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<ITemplate[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [successOpen, setSuccessOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const token = useAuthStore((s) => s.token);
    const _hasHydrated = useAuthStore((s) => s._hasHydrated);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);
    const router = useRouter();

    const fetchTemplates = async (name: string = '') => {
        try {
            setLoading(true);
            const response = await fetch(`/api/templates?page=${currentPage}&limit=10&name=${name}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || result.error);
            setTemplates(result.results);
            setTotalPages(result.totalPages);
            setApiError(null);
        } catch (error: any) {
            setApiError(error.message || 'Error fetching templates.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!_hasHydrated) return;
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const init = async () => {
            const user = await decodeToken(token);
            if (!user) return router.push('/auth/login');
            if (!['developer', 'admin'].includes(user.role)) return router.push('/');
            setUserInfo(user);
        };

        init();
    }, [_hasHydrated, token]);

    useEffect(() => {
        if (!_hasHydrated || !token || !userInfo) return;
        fetchTemplates(searchTerm);
    }, [_hasHydrated, token, userInfo, currentPage, searchTerm]);

    const confirmDelete = (id: string) => {
        setDeletingId(id);
        setAlertOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            const response = await fetch(`/api/templates/${deletingId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || result.error);
            setTemplates((prev) => prev.filter((t) => t._id !== deletingId));
            setSuccessOpen(true);
        } catch (error: any) {
            setApiError(error.message || 'Error deleting template.');
        } finally {
            setAlertOpen(false);
            setDeletingId(null);
        }
    };

    return (
        <>
            <div className="mx-auto mt-8 lg:px-36 md:px-28 sm:px-20">
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                    <BreadcrumbHeader backHref="/" title="Templates Management" />
                    {['developer', 'admin'].includes(userInfo?.role || '') && (
                        <Link href="/templates/new">
                            <Button className="bg-purple-700 hover:bg-purple-900">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Template
                            </Button>
                        </Link>
                    )}
                </div>

                <SearchInput
                    value={searchTerm}
                    onDebouncedChange={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                    placeholder="Search templates by name"
                />

                {apiError && <div className="text-red-500 bg-red-100 rounded-md p-4">{apiError}</div>}

                {loading ? (
                    <div className="mt-10 text-center text-muted-foreground">Loading templates...</div>
                ) : templates.length === 0 ? (
                    <div className="mt-10 text-center text-muted-foreground">No matching templates found.</div>
                ) : (
                    <TemplateTable
                        templates={templates}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        userInfo={userInfo}
                        loading={loading}
                        apiError={apiError}
                        successOpen={successOpen}
                        alertOpen={alertOpen}
                        onDelete={handleDelete}
                        confirmDelete={confirmDelete}
                        setCurrentPage={setCurrentPage}
                        setSuccessOpen={setSuccessOpen}
                        setAlertOpen={setAlertOpen}
                    />
                )}
            </div>

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Template Deleted"
                description="The template has been successfully removed."
                confirmLabel="OK"
                onConfirmAction={() => setSuccessOpen(false)}
                onOpenChangeAction={setSuccessOpen}
            />
        </>
    );
}
