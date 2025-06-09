"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { IClient } from "@/types/Client"
import { ITag } from "@/types/Tag"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import LoadingSpinner from "@/components/LoadingSpinner"
import Link from "next/link"
import {useAuthStore} from "@/lib/store";
import BreadcrumbHeader from "@/components/BreadcrumbHeader";

export default function ClientViewPage() {
    const params = useParams()
    const id = params.id
    const [client, setClient] = useState<IClient | null>(null)
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null)

    const token = useAuthStore((state) => state.token);
    const hydrated = useAuthStore((state) => state._hasHydrated);

    useEffect(() => {
        if(!hydrated)return;
        const fetchClient = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/clients/${id}/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ` + token
                    },
                })

                const result = await response.json()

                if (!response.ok) {
                    const errorMessage = result.message || result.error || "Unknown error occurred"
                    setApiError(errorMessage)
                    return
                }

                setClient(result.result)
                console.log("Client response", result.result)
            } catch (error) {
                console.error("Fetch error:", error)
                setApiError("Unexpected error occurred.")
            } finally {
                setLoading(false)
            }
        }

        fetchClient()
    }, [token, hydrated, id])

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner />
            </div>
        )
    }

    if (apiError || !client) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {apiError || "Client not found."}{" "}
                        <Link href="/clients" className="underline">
                            Return to clients list
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 space-y-6 max-w-3xl lg:px-44 md:px-20 px-4 transition-all duration-300 ease-in-out">
            <BreadcrumbHeader backHref="/clients" title="Visualice Client"/>
            <Card>
                <CardHeader>
                    <CardTitle>{client.firstName} {client.lastName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p><span className="font-medium">Email:</span> {client.email}</p>
                    <p><span className="font-medium">Phone:</span> {client.phone}</p>
                    <p><span className="font-medium">Telegram ID:</span> {client.telegram?.chatId || "—"}</p>
                    <p><span className="font-medium">Preferred Contact:</span> {client.preferredContactMethod}</p>
                    <p><span className="font-medium">Subscriptions:</span> {client.subscriptions.join(", ")}</p>
                    <p><span className="font-medium">Birth Date:</span> {new Date(client.birthDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Country:</span> {client.country}</p>
                    <p><span className="font-medium">Gender:</span> {client.gender}</p>
                    <p><span className="font-medium">Languages:</span></p>
                    {client.languages && client.languages.length > 0 ? (
                        client.languages.map((pref, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full text-sm">{pref}</span>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No languages set.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {client.preferences.length > 0 ? (
                        client.preferences.map((pref, idx) => (
                            <span key={idx} className="px-3 py-1 bg-amber-700 rounded-full text-sm">{pref}</span>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No preferences set.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {client.tags.length > 0 ? (
                        (client.tags as ITag[]).map((tag: ITag) => (
                            <span key={String(tag._id)} className="px-3 py-1 bg-emerald-700 rounded-full text-sm">{tag.name}</span>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No tags assigned.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ad Interactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {client.adInteractions.length > 0 ? (
                        client.adInteractions.map((interaction, idx) => (
                            <div key={idx} className="border p-2 rounded-md">
                                <p><span className="font-medium">Ad Message:</span> {typeof interaction.adMessage === "object" && "name" in interaction.adMessage ? interaction.adMessage.name : interaction.adMessage || "—"}</p>
                                <p><span className="font-medium">Status:</span> {interaction.status}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No ad interactions.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><span className="font-medium">Created:</span> {client.createdAt ? new Date(client.createdAt).toLocaleString() : "—"}</p>
                    <p><span className="font-medium">Last Updated:</span> {client.updatedAt ? new Date(client.updatedAt).toLocaleString() : "—"}</p>
                </CardContent>
            </Card>
        </div>
    )
}
