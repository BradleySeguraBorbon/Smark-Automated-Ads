'use client'

import { UseFormReturn } from 'react-hook-form'
import { UserFormData } from '@/types/forms'
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem
} from '@/components/ui/select'

interface Props {
    form: UseFormReturn<UserFormData>
    userRole: string
}

export default function UserContactFields({ form, userRole }: Props) {
    return (
        <>
            <FormField
                control={form.control}
                name="email"
                rules={{ required: 'Email is required' }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {userRole === 'developer' && (
                <FormField
                    control={form.control}
                    name="role"
                    rules={{ required: 'Role is required' }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employee">Employee</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="developer">Developer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </>
    )
}
