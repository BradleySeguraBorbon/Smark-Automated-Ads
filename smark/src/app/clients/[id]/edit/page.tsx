"use client"

import {useEffect, useState} from "react"
import {useRouter, useParams} from "next/navigation"
import {useForm} from "react-hook-form"
import {ITag} from "@/types/Tag"
import EditClientForm from "@/components/clients/EditClientForm"
import ClientAdditionalInfo from "@/components/clients/ClientAdditionalInfo"
import BreadcrumbHeader from "@/components/BreadcrumbHeader"
import LoadingSpinner from "@/components/LoadingSpinner"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import Link from "next/link"
import {useAuthStore} from "@/lib/store";
import {decodeToken} from "@/lib/utils/decodeToken";
import {ClientFormFields} from "@/types/forms/ClientForm";

export default function EditClientPage() {
    const params = useParams()
    const id = params.id
    const router = useRouter()
    const [apiError, setApiError] = useState<string | null>(null)
    const [notFound, setNotFound] = useState(false)
    const [loading, setLoading] = useState(true)
    const [fetchedTags, setFetchedTags] = useState<ITag[]>([])
    const token = useAuthStore((state) => state.token);
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);

    const form = useForm<ClientFormFields>({
        defaultValues: {
            _id: id,
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            telegram: {
                chatId: "",
                tokenKey: "",
                isConfirmed: false,
            },
            preferredContactMethod: "email",
            birthDate: new Date(),
            preferences: [],
            tags: [],
            subscriptions: [],
        },
    })

    useEffect(() => {
        if (!_hasHydrated) return
        const fetchClient = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/clients/${id}/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ` + token,
                    },
                })

                const result = await response.json()

                if (!response.ok) {
                    const errorMessage = result.message || result.error || "Unknown error occurred"
                    setApiError(errorMessage)
                    setNotFound(true)
                    return
                }

                const client = result.result
                if (client) {
                    form.reset({
                        ...client,
                        tags: (client.tags || []).map((tag: any) =>
                            typeof tag === "object" && tag._id ? tag._id : tag
                        ),
                        birthDate: client.birthDate instanceof Date ? client.birthDate : new Date(client.birthDate),
                    })
                } else {
                    setNotFound(true)
                }
            } catch (error) {
                console.error("Network or unexpected error:", error)
                setApiError("Unexpected error occurred.")
            } finally {
                setLoading(false)
            }
        }

        const fetchTags = async () => {
            try {
                const response = await fetch("/api/tags", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ` + token,
                    },
                })
                const result = await response.json()

                if (response.ok) {
                    setFetchedTags(result.results || [])
                } else {
                    console.error("Failed fetching tags", result)
                }
            } catch (error) {
                console.error("Error fetching tags:", error)
            }
        }

        const init = async () => {
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const user = await decodeToken(token);
            if (!user || user.role === 'employee') {
                router.push('/auth/login');
                return;
            }

            fetchClient()
            fetchTags()
        };

        init();
    }, [_hasHydrated, token, params.id, form])

    async function onSubmit(data: ClientFormFields) {
        try {
            const response = await fetch(`/api/clients/${data._id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ` + token,
                },
                body: JSON.stringify(data),
            })
            const result = await response.json()

            if (response.ok) {
                router.push("/clients")
            } else {
                console.error("Failed updating client", result)
                setApiError(result.message || result.error || "Failed to update client.")
            }
        } catch (error) {
            console.error("Error updating client:", error)
            setApiError("Unexpected error occurred during update.")
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner/>
                {apiError && (
                    <div className="text-center py-4 text-red-500 bg-red-100 rounded-md mt-6">{apiError}</div>
                )}
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Client not found.{" "}
                        <Link href="/clients" className="underline">
                            Return to clients list
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-3xl mx-auto space-y-8">
                <BreadcrumbHeader backHref="/clients" title="Edit Client"/>
                {apiError && (
                    <div className="text-center py-4 text-red-500 bg-red-100 rounded-md mb-6">{apiError}</div>
                )}
                <EditClientForm form={form} onSubmitAction={onSubmit} tags={fetchedTags} router={router}/>
                <ClientAdditionalInfo
                    preferences={form.getValues("preferences")}
                    subscriptions={form.getValues("subscriptions")}
                    preferredContactMethod={form.getValues("preferredContactMethod")}
                />
            </div>
        </div>
    )
}
