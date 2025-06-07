'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TagForm from '@/components/tags/TagForm';
import { UseFormReturn } from 'react-hook-form';
import { TagFormData } from '@/types/forms';
import { ITag } from '@/types/Tag';

interface Props {
    form: UseFormReturn<TagFormData>;
    token: string | null;
    setSuccessOpen: (v: boolean) => void;
    setErrorOpen: (v: boolean) => void;
    setInfoOpen: (v: boolean) => void;
    setErrorMessage: (msg: string) => void;
    setInfoMessage: (msg: string) => void;
}

export default function TagFormCard({
                                        form,
                                        token,
                                        setSuccessOpen,
                                        setErrorOpen,
                                        setInfoOpen,
                                        setErrorMessage,
                                        setInfoMessage,
                                    }: Props) {
    async function onSubmit(data: ITag) {
        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setErrorMessage(result.message || result.error || 'Unknown error');
                setErrorOpen(true);
                return;
            }

            if (result.warning) {
                setInfoMessage(result.warning);
                setInfoOpen(true);
            }

            setSuccessOpen(true);
        } catch {
            setErrorMessage('Unexpected error communicating with the server.');
            setErrorOpen(true);
        }
    }

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Tag Information</CardTitle>
            </CardHeader>
            <CardContent>
                <TagForm form={form} isEditMode={false} onSubmitAction={onSubmit} />
            </CardContent>
        </Card>
    );
}
