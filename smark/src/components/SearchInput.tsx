"use client"

import {Input} from '@/components/ui/input'

interface SearchInputProps {
    value: string
    onChange: (val: string) => void
    placeholder: string
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
    return (
        <div className="mb-6">
            <Input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}
