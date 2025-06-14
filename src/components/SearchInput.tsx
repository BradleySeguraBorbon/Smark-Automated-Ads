// components/SearchInput.tsx
"use client"

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
    value: string;
    onDebouncedChange: (val: string) => void;
    placeholder: string;
    debounceDelay?: number;
}

export default function SearchInput({
                                        value,
                                        onDebouncedChange,
                                        placeholder,
                                        debounceDelay = 1000,
                                    }: SearchInputProps) {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            onDebouncedChange(inputValue);
        }, debounceDelay);

        return () => clearTimeout(handler);
    }, [inputValue, debounceDelay, onDebouncedChange]);

    return (
        <div className="mb-6">
            <Input
                type="search"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
        </div>
    );
}
