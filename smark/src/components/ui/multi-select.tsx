"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"

type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChangeAction: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options = [], // Default to empty array
  selected = [], // Default to empty array
  onChangeAction,
  placeholder = "Select options...",
  className = "",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Ensure options and selected are arrays
  const safeOptions = Array.isArray(options) ? options : []
  const safeSelected = Array.isArray(selected) ? selected : []

  const handleUnselect = (option: string) => {
    onChangeAction(safeSelected.filter((s) => s !== option))
  }

  const selectables = safeOptions.filter((option) => !safeSelected.includes(option.value))

  return (
    <div className={`relative ${className}`}>
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex gap-1 flex-wrap">
          {safeSelected.map((option) => {
            const selectedOption = safeOptions.find((o) => o.value === option)
            return (
              <Badge key={option} variant="secondary">
                {selectedOption?.label || option}
                <button
                  type="button"
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(option)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleUnselect(option)
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setTimeout(() => {
                setOpen(false)
                setInputValue("")
              }, 200)
            }}
            placeholder={safeSelected.length === 0 ? placeholder : ""}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1 min-w-[120px]"
          />
        </div>
      </div>
      {open && selectables.length > 0 && (
        <div className="absolute w-full z-10 top-full mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <Command>
            <CommandGroup>
              {selectables.map((option) => (
                <CommandItem
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onSelect={() => {
                    onChangeAction([...safeSelected, option.value])
                    setInputValue("")
                  }}
                  className={"cursor-pointer"}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
      )}
    </div>
  )
}
