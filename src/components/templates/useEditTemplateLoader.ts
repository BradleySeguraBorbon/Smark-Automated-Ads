'use client'

import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { TemplateFormData } from '@/types/forms'
export function useEditTemplateLoader(
    id: string,
    token: string,
    form: UseFormReturn<TemplateFormData>
) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
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
                    setError(result.message || result.error || 'Template not found.')
                    return
                }

                const template = result.result
                form.reset({
                    ...template,
                    placeholders: Array.isArray(template.placeholders)
                        ? template.placeholders
                        : (template.placeholders || '').split(',').map((p:string) => p.trim())
                })
            } catch {
                setError('Unexpected error occurred.')
            } finally {
                setLoading(false)
            }
        }

        if (token && id) fetchTemplate()
    }, [id, token, form])

    return { loading, error }
}
