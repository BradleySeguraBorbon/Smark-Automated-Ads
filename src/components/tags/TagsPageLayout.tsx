'use client';

import { ITag } from '@/types/Tag';
import BreadcrumbHeader from '@/components/BreadcrumbHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import TagsList from '@/components/tags/TagsList';
import PaginationControls from '@/components/PaginationControls';
import CustomAlertDialog from '@/components/CustomAlertDialog';

interface Props {
    tags: ITag[];
    currentPage: number;
    totalPages: number;
    loading: boolean;
    apiError: string | null;
    userRole: string;
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    setCurrentPage: (v: number) => void;
    successOpen: boolean;
    successMessage: string;
    setSuccessOpen: (v: boolean) => void;
    setSuccessMessage: (v: string) => void;
    onRefresh: () => void;
}

export default function TagsPageLayout({
                                           tags, currentPage, totalPages, loading, apiError, userRole,
                                           searchTerm, setSearchTerm, setCurrentPage,
                                           successOpen, successMessage, setSuccessOpen, setSuccessMessage,
                                           onRefresh,
                                       }: Props) {
    return (
        <>
            <div className="mx-auto mt-8 px-4">
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                    <BreadcrumbHeader backHref="/" title="Tags Management" />
                    <Link href="/tags/new">
                        <Button variant="secondary" className="bg-purple-700 hover:bg-purple-900">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Tag
                        </Button>
                    </Link>
                </div>

                <SearchInput
                    value={searchTerm}
                    onDebouncedChange={(val) => {
                        if (val !== searchTerm) {
                            setSearchTerm(val);
                            setCurrentPage(1);
                        }
                    }}
                    placeholder="Search tags by name"
                />

                {apiError && (
                    <div className="text-center text-red-500 bg-red-100 p-3 rounded">{apiError}</div>
                )}

                {loading ? (
                    <div className="mt-10 text-center text-muted-foreground">Loading tags...</div>
                ) : tags.length === 0 ? (
                    <div className="mt-10 text-center text-muted-foreground">No matching tags found.</div>
                ) : (
                    <>
                        <TagsList
                            tags={tags}
                            refresh={onRefresh}
                            onSuccessDelete={(msg) => {
                                setSuccessMessage(msg);
                                setSuccessOpen(true);
                            }}
                            currentUserRole={userRole}
                        />
                        {totalPages > 1 && (
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChangeAction={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Tag deleted"
                description={successMessage}
                confirmLabel="OK"
                onConfirmAction={() => setSuccessOpen(false)}
                onOpenChangeAction={setSuccessOpen}
            />
        </>
    );
}
