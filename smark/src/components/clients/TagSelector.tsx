"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"

interface Tag {
    _id: string
    name: string
}

interface TagSelectorProps {
    tags: Tag[]
    selected: string[]
    onChangeAction: (newSelected: string[]) => void
}

export const TagSelector: React.FC<TagSelectorProps> = ({ tags, selected, onChangeAction }) => {
    const handleToggle = (tagId: string) => {
        if (selected.includes(tagId)) {
            onChangeAction(selected.filter((id) => id !== tagId))
            console.log('TagSelector:', { tags, selected });
        } else {
            onChangeAction([...selected, tagId])
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
                const isSelected = selected.includes(tag._id)
                return (
                    <Badge
                        key={tag._id}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer select-none ${isSelected ? "bg-emerald-600 text-white hover:bg-emerald-800" : ""}`}
                        onClick={() => handleToggle(tag._id)}
                    >
                        {tag.name}
                    </Badge>
                )
            })}
        </div>
    )
}
