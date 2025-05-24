'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ITag } from '@/types/Tag'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/LoadingSpinner'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import TagForm from '@/components/tags/TagForm'

export default function EditTagPage() {
    const { id } = useParams()
    const router = useRouter()
    const token = useAuthStore((state) => state.token)

    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null)
    const [successOpen, setSuccessOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const form = useForm<ITag>({
        defaultValues: {
            name: '',
            keywords: []
        },
    })

    useEffect(() => {
        const fetchTag = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/tags/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                })

                const result = await res.json()

                if (!res.ok) {
                    setApiError(result.message || result.error || 'Tag not found')
                    setErrorOpen(true)
                    return
                }

                const tag = result.result
                form.reset(tag)
            } catch (err) {
                setApiError('Failed to fetch tag')
                setErrorOpen(true)
            } finally {
                setLoading(false)
            }
        }

        if (token) fetchTag()
    }, [id, token, form])

    const onSubmit = async (data: ITag) => {
        try {
            const response = await fetch(`/api/tags/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                setErrorMessage(result.message || result.error || 'Update failed')
                setErrorOpen(true)
                return
            }

            setSuccessOpen(true)
            setTimeout(() => router.push('/tags'), 3000)
        } catch (err) {
            setErrorMessage('Unexpected error during update.')
            setErrorOpen(true)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-2xl mx-auto mt-6">
                <BreadcrumbHeader backHref="/tags" title="Edit Tag" />
                {apiError && (
                    <div className="text-center py-4 text-red-500 bg-red-100 rounded-md mt-4">
                        {apiError}
                    </div>
                )}

                <Card className="mt-4">
                    <CardContent>
                        <TagForm form={form} onSubmitAction={onSubmit} />
                    </CardContent>
                </Card>
            </div>

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Tag Updated!"
                description="The tag was updated successfully."
                confirmLabel="Return to list"
                onConfirmAction={() => {
                    setSuccessOpen(false)
                    router.push('/tags')
                }}
                onOpenChangeAction={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Update Error"
                description={errorMessage || apiError || 'An error occurred'}
                confirmLabel="Ok"
                onConfirmAction={() => setErrorOpen(false)}
                onOpenChangeAction={setErrorOpen}
            />
        </div>
    )
}
