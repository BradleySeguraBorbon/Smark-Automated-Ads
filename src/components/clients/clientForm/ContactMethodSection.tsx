"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ClientFormData } from "@/types/forms";

interface Props {
    form: UseFormReturn<ClientFormData>;
}

export default function ContactMethodSection({ form }: Props) {
    return (
        <FormField
            control={form.control}
            name="preferredContactMethod"
            rules={{
                required: "Preferred contact method is required",
                validate: (value: string) => ["email", "telegram"].includes(value) || "Invalid contact method",
            }}
            render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>Preferred Contact Method</FormLabel>
                    <FormControl>
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                        >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="email" />
                                </FormControl>
                                <FormLabel className="font-normal">Email</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="telegram" />
                                </FormControl>
                                <FormLabel className="font-normal">Telegram</FormLabel>
                            </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
