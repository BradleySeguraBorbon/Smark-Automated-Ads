'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2, PlusCircle } from 'lucide-react'

interface TagFormProps {
    form: ReturnType<typeof useFormContext>
    onSubmitAction: (data: any) => void
}

export default function TagForm({ form, onSubmitAction }: TagFormProps) {
    const [newKeyword, setNewKeyword] = useState('')

    const addKeyword = () => {
        const trimmed = newKeyword.trim()
        if (trimmed === '') return
        const current = form.getValues('keywords') || []
        if (!current.includes(trimmed)) {
            form.setValue('keywords', [...current, trimmed])
        }
        setNewKeyword('')
    }

    const removeKeyword = (index: number) => {
        const current = form.getValues('keywords') || []
        form.setValue('keywords', current.filter((_, i) => i !== index))
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-6">
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
                                            e.preventDefault()
                                            addKeyword()
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

                <div className="flex justify-end">
                    <Button variant="secondary" type="submit" className="bg-purple-500 hover:bg-purple-800">Create Tag</Button>
                </div>
            </form>
        </Form>
    )
}
