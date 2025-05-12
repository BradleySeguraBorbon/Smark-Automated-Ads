'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { IClient } from "@/types/Client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ClientForm from "@/components/clients/ClientForm"
import BreadcrumbHeader from "@/components/BreadcrumbHeader"
import CustomAlertDialog from "@/components/CustomAlertDialog"
import {useRef} from "react";

export default function CreateClientPage() {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()

    const [newPreference, setNewPreference] = useState("")
    const [successOpen, setSuccessOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

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

    async function onSubmit(data: IClient) {
        data.tags = []

        try {
            const response = await fetch("/api/clients/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                const errorMessage = result.message || result.error || "An unknown error has happened."
                setErrorMessage(errorMessage)
                setErrorOpen(true)
                return
            }

            console.log("Client created:", result)
            setSuccessOpen(true)
        } catch (error: unknown) {
            console.error("Network or unexpected error:", error)
            setErrorMessage("An unexpected error has occurred on network or server.")
            setErrorOpen(true)
        }
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
                description="The new client has been added to the database."
                confirmLabel="Accept"
                onConfirm={() => {
                    setSuccessOpen(false)
                    if (timeoutRef.current) clearTimeout(timeoutRef.current)
                    router.back();
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
        </div>
    )
}
