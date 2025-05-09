"use client"

interface SearchInputProps {
    value: string
    onChange: (val: string) => void
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
    return (
        <div className="mb-6">
            <input
                type="text"
                placeholder="Search clients..."
                className="w-full p-2 border rounded-md"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}
