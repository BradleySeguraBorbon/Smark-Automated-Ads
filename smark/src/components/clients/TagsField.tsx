"use client"

import { UseFormReturn } from "react-hook-form"
import { IClient } from "@/types/Client"
import { ITag } from "@/types/Tag"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { TagSelector } from "@/components/clients/TagSelector"
import {ClientFormData} from "@/types/forms";

interface Tag {
    _id: string
    name: string
}

interface TagsFieldProps {
    form: UseFormReturn<ClientFormData>
    tagOptions: Tag[]
}

export default function TagsField({ form, tagOptions }: TagsFieldProps) {
    return (
        <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
                <FormItem>
                    <div className="text-sm font-medium">Tags</div>
                    <FormControl>
                        <TagSelector
                            tags={tagOptions}
                            selected={(field.value || []).map((tag) => typeof tag === "string" ? tag : tag._id)}
                            onChangeAction={(newSelected) => field.onChange(newSelected)}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
