'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { TagFormData } from '@/types/forms';
import TagNameField from './TagNameField';
import TagKeywordsField from './TagKeywordsField';

interface TagFormProps {
    form: UseFormReturn<TagFormData>;
    onSubmitAction: (data: any) => void;
    isEditMode?: boolean;
}

export default function TagForm({
                                    form,
                                    onSubmitAction,
                                    isEditMode = false,
                                }: TagFormProps) {
    const [newKeyword, setNewKeyword] = useState('');

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmitAction)}
                className="space-y-6"
            >
                <TagNameField form={form} />
                <TagKeywordsField
                    form={form}
                    newKeyword={newKeyword}
                    setNewKeyword={setNewKeyword}
                />
                <div className="flex justify-end">
                    <Button
                        variant="secondary"
                        type="submit"
                        className="bg-purple-500 hover:bg-purple-800"
                    >
                        {isEditMode ? 'Save Tag' : 'Create Tag'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
