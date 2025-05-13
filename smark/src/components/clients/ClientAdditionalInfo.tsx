"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClientAdditionalInfoProps {
    preferences: string[]
    subscriptions: string[]
    preferredContactMethod: string
}

export default function ClientAdditionalInfo({
                                                 preferences,
                                                 subscriptions,
                                                 preferredContactMethod,
                                             }: ClientAdditionalInfoProps) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Client Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="font-semibold mb-2">Preferred Contact Method:</p>
                    <p className="text-sm">{preferredContactMethod || "Not specified"}</p>
                </div>
                <div>
                    <p className="font-semibold mb-2">Preferences:</p>
                    {preferences && preferences.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {preferences.map((pref, index) => (
                                <Badge key={index} variant="secondary" className="bg-amber-600">
                                    {pref}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No preferences defined.</p>
                    )}
                </div>
                <div>
                    <p className="font-semibold mb-2">Subscriptions:</p>
                    {subscriptions && subscriptions.length > 0 ? (
                        <ul className="list-disc list-inside text-sm">
                            {subscriptions.map((sub, index) => (
                                <li key={index}>{sub}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No subscriptions defined.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
