"use client"

import {Input} from '@/components/ui/input'

interface SearchInputProps {
    value: string
    onChangeAction: (val: string) => void
    placeholder: string
}

export default function SearchInput({ value, onChangeAction, placeholder }: SearchInputProps) {
    return (
        <div className="mb-6">
            <Input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChangeAction(e.target.value)}
            />
        </div>
    )
}
