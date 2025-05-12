'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ITemplate } from '@/types/Template'
import { useAuthStore } from '@/lib/store'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import TemplateForm from '@/components/templates/TemplateForm'
import DOMPurify from 'dompurify'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { isValidHtml } from '@/lib/utils/validateHtml'

export default function EditTemplatePage() {
    const router = useRouter()
    const { id } = useParams()
    const token = useAuthStore((s) => s.token)
    const _hasHydrated = useAuthStore((s) => s._hasHydrated)

    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null)
    const [successOpen, setSuccessOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const form = useForm<ITemplate>({
        defaultValues: {
            name: '',
            type: 'email',
            html: '',
            placeholders: []
        }
    })

    useEffect(() => {
        if (!_hasHydrated) return

        const fetchTemplate = async () => {
            try {
                const res = await fetch(`/api/templates/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                })

                const result = await res.json()

                if (!res.ok) {
                    setApiError(result.message || result.error || 'Template not found.')
                    return
                }

                const template = result.result
                form.reset({
                    ...template,
                    placeholders: Array.isArray(template.placeholders)
                        ? template.placeholders
                        : (template.placeholders || '').split(',').map((p: string) => p.trim())
                })
            } catch (err) {
                console.error('Fetch error:', err)
                setApiError('Unexpected error occurred.')
            } finally {
                setLoading(false)
            }
        }

        fetchTemplate()
    }, [_hasHydrated, token, id])

    const onSubmit = async (data: ITemplate) => {
        if (!isValidHtml(data.html)) {
            setErrorMessage("The HTML content appears to be invalid. Please check the html.")
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
            setTimeout(() => {
                router.push('/templates')
            }, 3000)
        } catch (err) {
            console.error('Update error:', err)
            setErrorMessage('Network error')
            setErrorOpen(true)
        }
    }

    if (loading) return <LoadingSpinner />

    if (apiError) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {apiError}{' '}
                        <Link href="/templates" className="underline">
                            Return to list
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6">
            <BreadcrumbHeader backHref="/templates" title="Edit Template" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                    <TemplateForm form={form} onSubmit={onSubmit} buttonText={"Save Template"} />
                </div>
                <div className="border rounded-md bg-white p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground mb-2">Live Content Preview</p>
                    <div
                        style={{
                            backgroundColor: '#fff',
                            color: '#000',
                            padding: '20px',
                            fontFamily: 'Arial, sans-serif',
                            borderRadius: '8px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                        }}
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(form.watch('html') || '', {
                                ALLOWED_ATTR: ['style', 'href', 'target'],
                                ALLOWED_TAGS: ['a', 'p', 'h1', 'h2', 'h3', 'ul', 'li', 'strong', 'em', 'div', 'span', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'b', 'i']
                            })
                        }}
                    />
                </div>
            </div>

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Template Updated"
                description="Changes saved successfully."
                confirmLabel="Go to Templates"
                onConfirm={() => router.push('/templates')}
                onOpenChange={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Update Error"
                description={errorMessage}
                confirmLabel="OK"
                onConfirm={() => setErrorOpen(false)}
                onOpenChange={setErrorOpen}
            />
        </div>
    )
}
