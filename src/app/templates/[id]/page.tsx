// components/templates/ViewTemplatePageContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { ITemplate } from '@/types/Template'
import LoadingSpinner from '@/components/LoadingSpinner'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import TemplateHtmlView from '@/components/templates/TemplateHtmlView'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'

export default function ViewTemplatePage() {
    const { id } = useParams()
    const router = useRouter()
    const token = useAuthStore((state) => state.token)
    const _hasHydrated = useAuthStore((state) => state._hasHydrated)

    const [template, setTemplate] = useState<ITemplate | null>(null)
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null)

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

                setTemplate(result.result)
            } catch {
                setApiError('Unexpected error occurred.')
            } finally {
                setLoading(false)
            }
        }

        fetchTemplate()
    }, [_hasHydrated, token, id])

    if (loading) return <LoadingSpinner />

    if (apiError || !template) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {apiError} <Link href="/templates" className="underline">Return to list</Link>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <BreadcrumbHeader backHref="/templates" title={template.name} />
            <TemplateHtmlView html={template.html} />
            <Card>
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p><span className="font-medium">Type:</span> {template.type}</p>
                    <p>
                        <span className="font-medium">Placeholders:</span>{' '}
                        {template.placeholders.length > 0 ? template.placeholders.join(', ') : 'None'}
                    </p>
                    <p><span className="font-medium">Created At:</span> {new Date(template.createdAt || '').toLocaleString()}</p>
                    <p><span className="font-medium">Updated At:</span> {new Date(template.updatedAt || '').toLocaleString()}</p>
                </CardContent>
            </Card>
        </div>
    )
}
