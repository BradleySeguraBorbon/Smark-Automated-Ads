"use client"

import { Control, useController } from "react-hook-form"
import { IClient } from "@/types/Client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface PreferenceManagerProps {
    fieldName: "preferences"
    control: Control<IClient>
    newPreference: string
    setNewPreferenceAction: (val: string) => void
}

export default function PreferenceManager({
                                              fieldName,
                                              control,
                                              newPreference,
                                              setNewPreferenceAction,
                                          }: PreferenceManagerProps) {
    const { field, fieldState } = useController({ name: fieldName, control })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Add your preferences for better targeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Client Preferences</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {field.value.map((preference: string, index: number) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-900">
                                {preference}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newPrefs = field.value.filter((p: string) => p !== preference)
                                        field.onChange(newPrefs)
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add preference (e.g., electronics, books)"
                            value={newPreference}
                            onChange={(e) => setNewPreferenceAction(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    if (newPreference && !field.value.includes(newPreference)) {
                                        field.onChange([...field.value, newPreference])
                                        setNewPreferenceAction("")
                                    }
                                }
                            }}
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                                if (newPreference && !field.value.includes(newPreference)) {
                                    field.onChange([...field.value, newPreference])
                                    setNewPreferenceAction("")
                                }
                            }}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <FormMessage>{fieldState.error?.message}</FormMessage>
            </CardContent>
        </Card>
    )
}
