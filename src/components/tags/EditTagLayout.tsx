'use client';

import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/LoadingSpinner';
import BreadcrumbHeader from '@/components/BreadcrumbHeader';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import TagForm from '@/components/tags/TagForm';

export default function EditTagLayout({
                                          form,
                                          loading,
                                          apiError,
                                          successOpen,
                                          errorOpen,
                                          errorMessage,
                                          setSuccessOpen,
                                          setErrorOpen,
                                          setErrorMessage,
                                          fetchTag,
                                          onSubmit,
                                      }: any) {
    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-2xl mx-auto mt-6">
                <BreadcrumbHeader backHref="/tags" title="Edit Tag" />
                {apiError && (
                    <div className="text-center py-4 text-red-500 bg-red-100 rounded-md mt-4">
                        {apiError}
                    </div>
                )}

                <Card className="mt-4">
                    <CardContent>
                        <TagForm form={form} isEditMode={true} onSubmitAction={onSubmit} />
                    </CardContent>
                </Card>
            </div>

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Tag Updated"
                description="The tag was updated successfully."
                confirmLabel="Return"
                onConfirmAction={() => {
                    setSuccessOpen(false);
                }}
                onOpenChangeAction={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Update Error"
                description={errorMessage}
                confirmLabel="OK"
                onConfirmAction={() => setErrorOpen(false)}
                onOpenChangeAction={setErrorOpen}
            />
        </div>
    );
}
