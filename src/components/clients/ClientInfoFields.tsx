"use client"

import { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import {ClientFormData} from "@/types/forms";
import {CLIENT_LANGUAGES} from "@/types/ClientLanguages";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import MultiSelectField from "@/components/MultiSelectField";

interface ClientInfoFieldsProps {
    form: UseFormReturn<ClientFormData>
}

export default function ClientInfoFields({ form }: ClientInfoFieldsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                            <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                            <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="telegram.chatId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Telegram Chat ID</FormLabel>
                        <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant="outline"
                                        className={`w-full pl-3 text-left font-normal ${
                                            !field.value && "text-muted-foreground"
                                        }`}
                                        disabled
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
                                    disabled
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                            <Input placeholder="Costa Rica" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="non-binary">Non-binary</SelectItem>
                                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                    <MultiSelectField
                        field={field}
                        label="Languages"
                        options={CLIENT_LANGUAGES}
                        placeholder="Select languages"
                        capitalizeOptions={false}
                    />
                )}
            />
        </div>
    )
}
