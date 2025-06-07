// app/templates/edit/[id]/page.tsx
'use client'

import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/lib/store'
import { useEditTemplateLoader } from '@/components/templates/useEditTemplateLoader'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import TemplateForm from '@/components/templates/TemplateForm'
import PreviewContentBox from '@/components/templates/PreviewContentBox'
import { isValidHtml, isValidMarkdown } from '@/lib/utils/validateHtml'
import { TemplateFormData } from '@/types/forms'
import { useState } from 'react'
import CustomDialogs from '@/components/templates/CustomDialogs'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function EditTemplatePage() {
    const router = useRouter()
    const { id } = useParams()
    const token = useAuthStore((s) => s.token)

    const [successOpen, setSuccessOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const form = useForm<TemplateFormData>({
        defaultValues: { name: '', type: 'email', html: '', placeholders: [] }
    })

    const { loading, error } = useEditTemplateLoader(id as string, token as string, form)

    const onSubmit = async (data: TemplateFormData) => {
        if (!isValidHtml(data.html) && !isValidMarkdown(data.html)) {
            setErrorMessage("The content must be valid HTML or Markdown.")
            setErrorOpen(true)
            return
        }

        try {
            const res = await fetch(`/api/templates/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (!res.ok) {
                setErrorMessage(result.message || result.error || 'Update failed.')
                setErrorOpen(true)
                return
            }

            setSuccessOpen(true)
            setTimeout(() => router.push('/templates'), 3000)
        } catch {
            setErrorMessage('Network error')
            setErrorOpen(true)
        }
    }

    if (loading) return <LoadingSpinner />
    if (error) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error} <Link href="/templates" className="underline">Return to list</Link>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-7">
            <BreadcrumbHeader backHref="/templates" title="Edit Template" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <TemplateForm form={form} onSubmitAction={onSubmit} buttonText="Save Template" />
                <PreviewContentBox html={form.watch("html") || ""} />
            </div>
            <CustomDialogs
                successOpen={successOpen}
                setSuccessOpen={setSuccessOpen}
                errorOpen={errorOpen}
                setErrorOpen={setErrorOpen}
                errorMessage={errorMessage}
                onSuccess={() => router.push('/templates')}
            />
        </div>
    )
}
