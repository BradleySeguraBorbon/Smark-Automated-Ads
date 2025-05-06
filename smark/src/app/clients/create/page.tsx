'use client'

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
import CustomAlertDialog from "@/components/CustomAlertDialog"

export default function CreateClientPage() {
    const router = useRouter()
    const { addClient } = useClientStore()
    const [mounted, setMounted] = useState(false)
    const [newPreference, setNewPreference] = useState("")
    const [successOpen, setSuccessOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [infoOpen, setInfoOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [infoMessage, setInfoMessage] = useState("")

    const currentPath = usePathname()
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
                const errorMessage = result.message || result.error || "Ocurrió un error desconocido."
                setErrorMessage(errorMessage)
                setErrorOpen(true)
                return
            }

            console.log("Client created:", result)
            addClient(data)

            // Si hay warning tipo aiError, mostrar info modal
            if (result.warning) {
                setInfoMessage(result.warning)
                setInfoOpen(true)
            }

            setSuccessOpen(true)

            setTimeout(() => {
                router.push("/clients")
            }, 4000)
        } catch (error: unknown) {
            console.error("Network or unexpected error:", error)
            setErrorMessage("An unexpected error has occurred on network or server.")
            setErrorOpen(true)
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
                <Navbar currentPath={currentPath}/>
            </header>

            <BreadcrumbHeader backHref="/clients" title="Create New Client" />

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

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="¡Client created successfully!"
                description="The new client has been added to the data base."
                confirmLabel="Go to clients"
                onConfirm={() => {
                    setSuccessOpen(false)
                    router.push("/clients")
                }}
                onOpenChange={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Error creating client"
                description={errorMessage}
                confirmLabel="Ok"
                onConfirm={() => setErrorOpen(false)}
                onOpenChange={setErrorOpen}
            />

            <CustomAlertDialog
                open={infoOpen}
                type="info"
                title="Attention"
                description={infoMessage}
                confirmLabel="Ok"
                onConfirm={() => setInfoOpen(false)}
                onOpenChange={setInfoOpen}
            />
        </div>
    )
}
