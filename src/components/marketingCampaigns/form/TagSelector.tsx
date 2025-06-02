'use client'

import React from "react";
import { Badge } from "@/components/ui/badge";
import { TagRef } from "@/types/Tag";
import { Tag } from "lucide-react";

export function TagSelector({
  tags = [],
  selectedTags = [],
  onChangeAction,
}: {
  tags?: TagRef[];
  selectedTags?: TagRef[];
  onChangeAction: (updated: TagRef[]) => void;
}) {
  const toggleTag = (tag: TagRef) => {
    const exists = selectedTags.find((t) => t._id === tag._id);
    if (exists) {
      onChangeAction(selectedTags.filter((t) => t._id !== tag._id));
    } else {
      onChangeAction([...selectedTags, tag]);
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
            className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 ease-in-out"
          >
            <Tag className="h-3 w-3" />
            {tag.name}
          </Badge>
        ))}
    </div>
  );
}