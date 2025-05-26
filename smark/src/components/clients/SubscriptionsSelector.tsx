"use client"

import { Control, useController } from "react-hook-form"
import { IClient } from "@/types/Client"
import { Checkbox } from "@/components/ui/checkbox"
import { FormItem, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"

interface SubscriptionsSelectorProps {
    control: Control<IClient>
}

export default function SubscriptionsSelector({ control }: SubscriptionsSelectorProps) {
    const { field, fieldState } = useController({
        name: "subscriptions",
        control,
        rules: {
            validate: (value) =>
                value && value.length >= 1 || "You have to select at least one subscription.",
        },
    })

    const toggleSubscription = (value: string) => {
        const newValue = field.value.includes(value)
            ? field.value.filter((v: string) => v !== value)
            : [...field.value, value]
        field.onChange(newValue)
    }

    return (
        <FormItem className="space-y-2">
            <Label>Subscriptions</Label>
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="subscription-email"
                        checked={field.value.includes("email")}
                        onCheckedChange={() => toggleSubscription("email")}
                    />
                    <Label htmlFor="subscription-email">Email Announcements</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="subscription-telegram"
                        checked={field.value.includes("telegram")}
                        onCheckedChange={() => toggleSubscription("telegram")}
                    />
                    <Label htmlFor="subscription-telegram">Telegram Messages</Label>
                </div>
            </div>
            <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
    )
}
