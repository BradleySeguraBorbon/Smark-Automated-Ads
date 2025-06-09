'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import EditTagLayout from '@/components/tags/EditTagLayout';
import useEditTagLogic from '@/components/tags/useEditTagLogic';

export default function EditTagPage() {
    const { id } = useParams();
    const router = useRouter();
    const token = useAuthStore((s) => s.token);

    const {
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
    } = useEditTagLogic({ id, token, router });

    return (
        <EditTagLayout
            form={form}
            loading={loading}
            apiError={apiError}
            successOpen={successOpen}
            errorOpen={errorOpen}
            errorMessage={errorMessage}
            setSuccessOpen={setSuccessOpen}
            setErrorOpen={setErrorOpen}
            setErrorMessage={setErrorMessage}
            fetchTag={fetchTag}
            onSubmit={onSubmit}
        />
    );
}
