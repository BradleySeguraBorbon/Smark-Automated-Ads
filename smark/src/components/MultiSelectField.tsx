"use client"

import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ControllerRenderProps } from "react-hook-form"

interface MultiSelectFieldProps {
    field: ControllerRenderProps<any, any>
    label: string
    options: string[]
    placeholder?: string
    capitalizeOptions?: boolean
}

export default function MultiSelectField({
     field,
     label,
     options,
     placeholder = "Select options",
     capitalizeOptions = false,
}: MultiSelectFieldProps) {
    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                                "w-full justify-between",
                                !field.value?.length && "text-muted-foreground"
                            )}
                        >
                            {field.value?.length > 0
                                ? field.value.join(", ")
                                : placeholder}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-2 max-h-64 overflow-y-auto">
                    {options.map((opt) => {
                        const selected = field.value?.includes(opt)
                        return (
                            <div
                                key={opt}
                                className="flex items-center space-x-2 cursor-pointer hover:bg-muted rounded-md px-2 py-1"
                                onClick={() => {
                                    if (selected) {
                                        field.onChange(field.value.filter((v: string) => v !== opt))
                                    } else {
                                        field.onChange([...(field.value || []), opt])
                                    }
                                }}
                            >
                                <div
                                    className={cn(
                                        "h-4 w-4 rounded-sm border border-muted-foreground",
                                        selected && "bg-primary text-primary-foreground"
                                    )}
                                >
                                    {selected && <Check className="h-4 w-4" />}
                                </div>
                                <span className={capitalizeOptions ? "capitalize" : ""}>{opt}</span>
                            </div>
                        )
                    })}
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    )
}
