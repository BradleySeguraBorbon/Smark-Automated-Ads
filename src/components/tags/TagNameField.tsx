'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TagFormData } from '@/types/forms';
import { UseFormReturn } from 'react-hook-form';

interface Props {
    form: UseFormReturn<TagFormData>;
}

export default function TagNameField({ form }: Props) {
    return (
        <FormField
            control={form.control}
            name="name"
            rules={{ required: 'Tag name is required' }}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="EcoFriendly" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
