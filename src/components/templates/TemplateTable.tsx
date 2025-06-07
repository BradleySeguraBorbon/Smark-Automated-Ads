'use client';

import TemplateRow from './TemplateRow';
import PaginationControls from '@/components/PaginationControls';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import {ITemplate} from '@/types/Template';

interface TemplatesTableProps {
    templates: ITemplate[];
    currentPage: number;
    totalPages: number;
    userInfo: { username: string; role: string; id: string } | null;
    loading: boolean;
    apiError: string | null;
    successOpen: boolean;
    alertOpen: boolean;
    onDelete: () => Promise<void>;
    confirmDelete: (id: string) => void;
    setCurrentPage: (page: number) => void;
    setAlertOpen: (val: boolean) => void;
    setSuccessOpen: (val: boolean) => void;
}

export default function TemplateTable({
                                          templates,
                                          currentPage,
                                          totalPages,
                                          userInfo,
                                          confirmDelete,
                                          onDelete,
                                          setCurrentPage,
                                          alertOpen,
                                          setAlertOpen,
                                      }: TemplatesTableProps) {
    return (
        <>
            <div className="overflow-x-auto border border-gray-600 rounded-xl shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Last Update</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {templates.map((template) => (
                        <TemplateRow
                            key={template._id as string}
                            template={template}
                            userRole={userInfo?.role || ''}
                            onDeleteAction={confirmDelete}
                        />
                    ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChangeAction={setCurrentPage}
                />
            )}

            <CustomAlertDialog
                open={alertOpen}
                type="warning"
                title="Delete Template"
                description="Are you sure you want to delete this template? This action cannot be undone."
                onConfirmAction={onDelete}
                onCancelAction={() => setAlertOpen(false)}
                onOpenChangeAction={setAlertOpen}
            />
        </>
    );
}
