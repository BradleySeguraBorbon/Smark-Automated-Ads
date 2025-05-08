'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { IClient } from "@/types/Client"
import { useClientStore, useAuthStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (!token) {
            return;
        }
        setMounted(true)
    }, [token])

    async function onSubmit(data: IClient) {
        data.tags = []

        try {
            const response = await fetch("/api/clients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ` + token,
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                console.log("Response is not ok: ", result)
                const errorMessage = result.message || result.error || "An unknow error has happened."
                setErrorMessage(errorMessage)
                setErrorOpen(true)
                return
            }

            console.log("Client created:", result)
            addClient(data)

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
                <LoadingSpinner/>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-2 mb-4">
            <div className="lg:max-w-3xl mx-auto px-4 mt-4">
                <div className="mb-4">
                <BreadcrumbHeader backHref="/clients" title="Create New Client"/>
                </div>
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
