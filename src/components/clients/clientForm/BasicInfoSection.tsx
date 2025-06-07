"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ClientFormData } from "@/types/forms";

interface Props {
    form: UseFormReturn<ClientFormData>;
}

export default function BasicInfoSection({ form }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="firstName"
                rules={{
                    required: "First name is required",
                    maxLength: { value: 50, message: "First name cannot exceed 50 characters" },
                }}
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="lastName"
                rules={{
                    required: "Last name is required",
                    maxLength: { value: 50, message: "Last name cannot exceed 50 characters" },
                }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                rules={{
                    required: "Email is required",
                    pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid email address",
                    },
                }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="phone"
                rules={{
                    required: "Phone number is required",
                    pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: "Invalid phone number format",
                    },
                }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
