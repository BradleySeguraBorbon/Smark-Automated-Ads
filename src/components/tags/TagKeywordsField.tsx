'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import { TagFormData } from '@/types/forms';
import { UseFormReturn } from 'react-hook-form';

interface Props {
    form: UseFormReturn<TagFormData>;
    newKeyword: string;
    setNewKeyword: (value: string) => void;
}

export default function TagKeywordsField({
                                             form,
                                             newKeyword,
                                             setNewKeyword,
                                         }: Props) {
    const addKeyword = () => {
        const trimmed = newKeyword.trim();
        if (trimmed === '') return;
        const current = form.getValues('keywords') || [];
        if (!current.includes(trimmed)) {
            form.setValue('keywords', [...current, trimmed]);
        }
        setNewKeyword('');
    };

    const removeKeyword = (index: number) => {
        const current: string[] = form.getValues('keywords') || [];
        form.setValue('keywords', current.filter((_, i) => i !== index));
    };

    return (
        <FormField
            control={form.control}
            name="keywords"
            rules={{
                validate: (value) =>
                    Array.isArray(value) && value.length > 0
                        ? true
                        : 'At least one keyword is required',
            }}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Keywords</FormLabel>
                    <div className="flex gap-2 mb-2">
                        <Input
                            placeholder="Add keyword"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            className="w-full"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addKeyword();
                                }
                            }}
                        />
                        <Button type="button" onClick={addKeyword}>
                            <PlusCircle className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>
                    {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {field.value.map((kw: string, idx: number) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => removeKeyword(idx)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-sm font-medium text-white hover:bg-red-200 hover:text-red-700 transition-all shadow-sm"
                                    title="Click to remove keyword"
                                >
                                    <span>{kw}</span>
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
