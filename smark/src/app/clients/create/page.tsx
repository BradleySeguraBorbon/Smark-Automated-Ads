"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useForm } from "react-hook-form"
import { IClient } from "@/types/Client"
import { useClientStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/Navbar"
import ClientForm from "@/components/clients/ClientForm"
import BreadcrumbHeader from "@/components/BreadcrumbHeader"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function CreateClientPage() {
    const router = useRouter()
    const { addClient } = useClientStore()
    const [mounted, setMounted] = useState(false)
    const [newPreference, setNewPreference] = useState("")
    const [apiError, setApiError] = useState<string | null>(null)

    const currentPath = usePathname()
    const routes = [
        { href: "/", label: "Dashboard" },
        { href: "/campaigns", label: "Campaigns" },
        { href: "/adMessages", label: "Ad-Messages" },
        { href: "/clients", label: "Clients" },
        { href: "/analytics", label: "Analytics" },
    ]

    const form = useForm<IClient>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            telegramChatId: "",
            preferredContactMethod: "email",
            birthDate: new Date(),
            preferences: [],
            tags: [],
            subscriptions: [],
        },
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    async function onSubmit(data: IClient) {
        data.tags = []

        try {
            const response = await fetch("/api/clients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2ODE2YmI0YzcwZDdhNjY4ZGY0ZDc4YTYiLCJ1c2VybmFtZSI6IlNlYmFzdGlhbiIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NDY0MTYyNzgsImV4cCI6MTc0Njc3NjI3OH0.ZOTimuCUNqAQWQgYiz1YJSWL5ly1jYxv753YGnK5EIo`,
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                console.log("Response is not ok: ", result)
                const errorMessage = result.message || result.error || "Unknown error occurred"
                setApiError(errorMessage)
                return
            }

            console.log("Client created:", result)
            setApiError(null)
            addClient(data)
            router.back()
        } catch (error) {
            console.error("Network or unexpected error:", error)
            alert("Unexpected error occurred.")
        }
    }

    if (!mounted) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <header>
                <Navbar currentPath={currentPath} routes={routes} />
            </header>

            <BreadcrumbHeader backHref="/clients" title="Create New Client" />

            {apiError && (
                <div className="text-center py-4 text-red-500 bg-red-100 rounded-md mb-6">{apiError}</div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <ClientForm
                        form={form}
                        onSubmit={onSubmit}
                        newPreference={newPreference}
                        setNewPreference={setNewPreference}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
