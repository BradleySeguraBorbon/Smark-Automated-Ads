'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ClientForm from "@/components/clients/ClientForm"
import BreadcrumbHeader from "@/components/BreadcrumbHeader"
import CustomAlertDialog from "@/components/CustomAlertDialog"
import {useRef} from "react";
import {ClientFormData} from "@/types/forms";

export default function CreateClientPage() {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()

    const [newPreference, setNewPreference] = useState("")
    const [successOpen, setSuccessOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("You have been registered successfully.");

    const form = useForm<ClientFormData>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            telegram: {
                chatId: "",
                tokenKey: "",
                isConfirmed: false
            },
            preferredContactMethod: "email",
            country: "",
            gender:"male",
            birthDate: new Date(2005, 1,1),
            preferences: [],
            tagsPending:true,
            tags: [],
            subscriptions: [],
        },
    })

    async function onSubmit(data: ClientFormData) {
        data.tags = [];

        try {
            const response = await fetch("/api/clients/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.message || result.error || "An unknown error has happened.";
                setErrorMessage(errorMessage);
                setErrorOpen(true);
                return;
            }

            const isTelegramSubscribed = data.subscriptions.includes("telegram");

            if (isTelegramSubscribed) {
                setSuccessMessage("You have been registered successfully. Please check your Telegram.");
            } else {
                setSuccessMessage("You have been registered successfully.");
            }

            setSuccessOpen(true);

            fetch("/api/clients/post-process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify({
                    clientId: result.result._id,
                    email: result.result.email,
                    preferences: result.result.preferences,
                    subscriptions: result.result.subscriptions,
                }),
            }).catch((err) => {
                console.error("[POST-PROCESS] Background processing failed:", err);
            });
        } catch (error: unknown) {
            console.error("Network or unexpected error:", error);
            setErrorMessage("An unexpected error has occurred on network or server.");
            setErrorOpen(true);
        }
    }

    return (
        <div className="container mx-auto py-2 mb-4">
            <div className="lg:max-w-3xl mx-auto px-4 mt-4">
                <div className="mb-4">
                    <BreadcrumbHeader backHref="/clients" title="Register"/>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ClientForm
                            form={form}
                            onSubmitAction={onSubmit}
                            newPreferenceAction={newPreference}
                            setNewPreferenceAction={setNewPreference}
                        />
                    </CardContent>
                </Card>
            </div>

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="¡You have been register successfully!"
                description={successMessage}
                confirmLabel="Accept"
                onConfirmAction={() => {
                    setSuccessOpen(false)
                    if (timeoutRef.current) clearTimeout(timeoutRef.current)
                    router.back();
                }}
                onOpenChangeAction={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Error creating client"
                description={errorMessage}
                confirmLabel="Ok"
                onConfirmAction={() => setErrorOpen(false)}
                onOpenChangeAction={setErrorOpen}
            />
        </div>
    )
}
