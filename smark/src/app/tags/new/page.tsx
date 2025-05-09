'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ITag } from '@/types/Tag'
import { useAuthStore } from '@/lib/store'
import { decodeToken } from '@/lib/utils/decodeToken'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import LoadingSpinner from '@/components/LoadingSpinner'
import TagForm from '@/components/tags/TagForm'

export default function CreateTagPage() {
    const router = useRouter()
    const token = useAuthStore((state) => state.token)

    const [mounted, setMounted] = useState(false)
    const [successOpen, setSuccessOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [infoOpen, setInfoOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [infoMessage, setInfoMessage] = useState("")

    const form = useForm<ITag>({
        defaultValues: {
            name: '',
            keywords: []
        },
    })

    useEffect(() => {
        if (!token) return
        decodeToken(token).then(() => setMounted(true))
    }, [token])

    const onSubmit = async (data: ITag) => {
        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                const message = result.message || result.error || 'Unknown error'
                setErrorMessage(message)
                setErrorOpen(true)
                return
            }

            if (result.warning) {
                setInfoMessage(result.warning)
                setInfoOpen(true)
            }

            setSuccessOpen(true)
            setTimeout(() => {
                router.push('/tags')
            }, 3000)
        } catch (err) {
            console.error(err)
            setErrorMessage('Unexpected error communicating with the server.')
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
        <div className="container mx-auto py-4 mb-6">
            <div className="max-w-2xl mx-auto px-4 mt-4">
                <BreadcrumbHeader backHref="/tags" title="Create New Tag" />
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Tag Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TagForm form={form} onSubmit={onSubmit}/>
                    </CardContent>
                </Card>
            </div>

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Tag Created Successfully!"
                description="The new tag has been saved into the system."
                confirmLabel="Go to tags"
                onConfirm={() => {
                    setSuccessOpen(false)
                    router.push('/tags')
                }}
                onOpenChange={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Error Creating Tag"
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
