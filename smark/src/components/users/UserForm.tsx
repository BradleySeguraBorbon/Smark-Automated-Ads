'use client';

import {UseFormReturn} from 'react-hook-form';
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';

interface CreateUserFormData {
    username: string;
    password: string;
    email: string;
    role?: string;
}

interface UserFormProps {
    form: UseFormReturn<CreateUserFormData>;
    onSubmitAction: (data: CreateUserFormData) => void;
    userRole: string;
    isSubmitting: boolean;
}

export default function UserForm({ form, onSubmitAction, userRole, isSubmitting }: UserFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    rules={{
                        required: "Username is required",
                        maxLength: { value: 50, message: "Last name cannot exceed 50 characters" },
                    }}
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter username" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    rules={{
                        required: "Password is required",
                        maxLength: { value: 50, message: "Password cannot exceed 50 characters" },
                    }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password"
                                        {...field}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <Eye className="h-5 w-5" />
                                        ) : (
                                            <EyeOff className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
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
                        maxLength: { value: 80, message: "Email cannot exceed 80 characters" },
                    }}
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter email" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                {userRole === 'developer' && (
                    <FormField
                        control={form.control}
                        name="role"
                        rules={{
                            required: "Role is required",
                            maxLength: { value: 50, message: "Last name cannot exceed 50 characters" },
                        }}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="employee"
                                                className="hover:bg-emerald-100 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white [&>[data-slot=check]]:text-black"
                                            >
                                                Employee
                                            </SelectItem>
                                            <SelectItem
                                                value="admin"
                                                className="hover:bg-emerald-100 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white [&>[data-slot=check]]:text-black"
                                            >Admin</SelectItem>
                                            <SelectItem
                                                value="developer"
                                                className="hover:bg-emerald-100 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white [&>[data-slot=check]]:text-black"
                                            >Developer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                )}

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create User'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
