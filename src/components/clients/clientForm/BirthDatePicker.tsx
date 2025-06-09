"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { UseFormReturn } from "react-hook-form";
import { ClientFormData } from "@/types/forms";

interface Props {
    form: UseFormReturn<ClientFormData>;
}

export default function BirthDatePicker({ form }: Props) {
    return (
        <FormField
            control={form.control}
            name="birthDate"
            rules={{
                required: "Birth date is required",
                validate: (value: Date) => value <= new Date() || "Birth date cannot be in the future",
            }}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => date && field.onChange(date)}
                                disabled={(date) => !date || date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                                captionLayout="dropdown"
                                defaultMonth={new Date(2005, 1)}
                            />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
