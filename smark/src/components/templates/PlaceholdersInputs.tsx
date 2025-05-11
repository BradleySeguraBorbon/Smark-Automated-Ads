'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormLabel, FormItem, FormMessage } from '@/components/ui/form'
import { Trash2, PlusCircle } from 'lucide-react'
import { ControllerRenderProps } from 'react-hook-form'
import { ITemplate } from '@/types/Template'

interface Props {
    field: ControllerRenderProps<ITemplate, 'placeholders'>
}

export default function PlaceholdersInput({ field }: Props) {
    const [input, setInput] = useState('')

    const addPlaceholder = () => {
        const trimmed = input.trim()
        if (trimmed === '') return
        const current = field.value || []
        if (!current.includes(trimmed)) {
            field.onChange([...current, trimmed])
        }
        setInput('')
    }

    const removePlaceholder = (index: number) => {
        const current = field.value || []
        field.onChange(current.filter((_, i) => i !== index))
    }

    return (
        <FormItem>
            <FormLabel>Placeholders</FormLabel>
            <div className="flex gap-2 mb-2">
                <Input
                    placeholder="e.g. {{name}}"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            addPlaceholder()
                        }
                    }}
                />
                <Button type="button" onClick={addPlaceholder}>
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Add
                </Button>
            </div>

            {field.value.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {field.value.map((ph: string, idx: number) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => removePlaceholder(idx)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-800 hover:bg-red-100 hover:text-red-700 transition-all border border-gray-300 shadow-sm"
                            title="Click to remove placeholder"
                        >
                            <span>{ph}</span>
                            <Trash2 className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            )}

            <FormMessage />
        </FormItem>
    )
}
