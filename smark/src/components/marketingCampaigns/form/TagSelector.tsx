'use client'

import React from "react";
import { Badge } from "@/components/ui/badge";
import { TagRef } from "@/types/Tag";

export function TagSelector({
  tags = [],
  selectedTags = [],
  onChange,
}: {
  tags?: TagRef[];
  selectedTags?: TagRef[];
  onChange: (updated: TagRef[]) => void;
}) {
  const toggleTag = (tag: TagRef) => {
    const exists = selectedTags.find((t) => t._id === tag._id);
    if (exists) {
      onChange(selectedTags.filter((t) => t._id !== tag._id));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags && tags.length === 0 ? <p className="mt-2"><i>No Tags</i></p>
        : tags.map((tag) => (
          <Badge
            key={String(tag._id)}
            onClick={() => toggleTag(tag)}
            variant={selectedTags.find((t) => t._id === tag._id) ? "default" : "outline"}
            className="cursor-pointer"
          >
            {tag.name}
          </Badge>
        ))}
    </div>
  );
}