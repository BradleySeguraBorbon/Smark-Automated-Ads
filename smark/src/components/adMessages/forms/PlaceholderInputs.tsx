"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PlaceholderInputsProps {
  placeholders: string[]
  values: Record<string, string>
  onChangeAction: (placeholder: string, value: string) => void
}

export function PlaceholderInputs({ placeholders, values, onChangeAction }: PlaceholderInputsProps) {
  return (
    <div className="space-y-4">
      {placeholders.map((placeholder) => (
        <div key={placeholder} className="space-y-2">
          <Label htmlFor={`placeholder-${placeholder}`} className="capitalize">
            {placeholder.replace(/_/g, " ")}
          </Label>
          <Textarea
            id={`placeholder-${placeholder}`}
            placeholder={`Enter ${placeholder.replace(/_/g, " ")}`}
            value={values[placeholder] || ""}
            onChange={(e) => onChangeAction(placeholder, e.target.value)}
            className="resize-y min-h-[80px] max-h-[200px]"
            rows={3}
          />
        </div>
      ))}
    </div>
  )
}
