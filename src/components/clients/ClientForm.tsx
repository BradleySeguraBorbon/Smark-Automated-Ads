"use client"

import { IClient } from "@/types/Client"
import { ControllerRenderProps, UseFormReturn } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import PreferenceManager from "@/components/clients/PreferenceManager"
import SubscriptionsSelector from "@/components/clients/SubscriptionsSelector"
import {ClientFormData} from "@/types/forms";
import { CLIENT_LANGUAGES } from "@/types/ClientLanguages"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import MultiSelectField from "@/components/MultiSelectField";

interface ClientFormProps {
    form: UseFormReturn<ClientFormData>
    onSubmitAction: (data: ClientFormData) => void
    newPreferenceAction: string
    setNewPreferenceAction: (value: string) => void
}

export default function ClientForm({ form, onSubmitAction, newPreferenceAction, setNewPreferenceAction }: ClientFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-6">
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
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="+1 (555) 123-4567" {...field} type="tel" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/*<FormField
                        control={form.control}
                        name="telegramChatId"
                        rules={{
                            maxLength: {
                                value: 50,
                                message: "Telegram Chat ID cannot exceed 50 characters",
                            },
                            required: "Telegram Chat ID is required",
                            validate: value =>
                                value.trim() !== "" || "Telegram Chat ID cannot be empty or just spaces",
                        }}
                        render={({ field }: ControllerRenderProps<IClient, 'telegramChatId'>) => (
                            <FormItem>
                                <FormLabel>Telegram Chat Id</FormLabel>
                                <FormControl>
                                    <Input placeholder="id" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />*/}

                    <FormField
                        control={form.control}
                        name="birthDate"
                        rules={{
                            required: "Birth date is required",
                            validate: (value: Date) =>
                                value <= new Date() || "Birth date cannot be in the future",
                        }}
                        render={({field}) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Birth Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={`w-full pl-3 text-left font-normal ${
                                                    !field.value && "text-muted-foreground"
                                                }`}
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
                                            onSelect={(date) => {
                                                if (date) field.onChange(date)
                                            }}
                                            disabled={(date) =>
                                                !date || date > new Date() || date < new Date("1900-01-01")
                                            }
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

                <FormField
                    control={form.control}
                    name="preferredContactMethod"
                    rules={{
                        required: "Preferred contact method is required",
                        validate: (value: string) =>
                            ["email", "telegram"].includes(value) || "Invalid contact method",
                    }}
                    render={({field}) => (
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

                <FormField
                    control={form.control}
                    name="preferences"
                    rules={{
                        validate: (value: string[]) => {
                            if (!value || value.length <= 1) {
                                console.log(value);
                                return "At least two preferences are required"
                            }
                            return true
                        },
                    }}
                    render={() => (
                        <PreferenceManager
                            fieldName="preferences"
                            control={form.control}
                            newPreference={newPreferenceAction}
                            setNewPreferenceAction={setNewPreferenceAction}
                        />
                    )}
                />

                <SubscriptionsSelector control={form.control} />

                <div className="flex justify-end">
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-800" variant="secondary">Register</Button>
                </div>
            </form>
        </Form>
    )
}
