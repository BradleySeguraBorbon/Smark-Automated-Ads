'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { decodeToken } from '@/lib/utils/decodeToken';
import { TagFormData } from '@/types/forms';
import BreadcrumbHeader from '@/components/BreadcrumbHeader';
import TagFormCard from '@/components/tags/TagFormCard';
import TagDialogs from '@/components/tags/TagDialogs';

export default function CreateTagPage() {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const [mounted, setMounted] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    const form = useForm<TagFormData>({
        defaultValues: { name: '', keywords: [] },
    });

    useEffect(() => {
        if (!token) return;
        decodeToken(token).then(() => setMounted(true));
    }, [token]);

    if (!mounted) return null;

    return (
        <div className="container mx-auto py-4 mb-6">
            <div className="max-w-2xl mx-auto px-4 mt-4">
                <BreadcrumbHeader backHref="/tags" title="Create New Tag" />
                <TagFormCard
                    form={form}
                    token={token}
                    setSuccessOpen={setSuccessOpen}
                    setErrorOpen={setErrorOpen}
                    setInfoOpen={setInfoOpen}
                    setErrorMessage={setErrorMessage}
                    setInfoMessage={setInfoMessage}
                />
            </div>

            <TagDialogs
                router={router}
                successOpen={successOpen}
                errorOpen={errorOpen}
                infoOpen={infoOpen}
                errorMessage={errorMessage}
                infoMessage={infoMessage}
                setSuccessOpen={setSuccessOpen}
                setErrorOpen={setErrorOpen}
                setInfoOpen={setInfoOpen}
            />
        </div>
    );
}
