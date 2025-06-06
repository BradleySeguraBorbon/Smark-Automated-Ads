'use client'

import {useState, useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useRouter} from 'next/navigation'
import {useAuthStore} from '@/lib/store'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import LoadingSpinner from '@/components/LoadingSpinner'
import TemplateForm from '@/components/templates/TemplateForm'
import DOMPurify from 'dompurify'
import {isValidHtml, isValidMarkdown} from '@/lib/utils/validateHtml'
import MarkdownIt from 'markdown-it'
import {TemplateFormData} from "@/types/forms";

export default function CreateTemplatePage() {
    const router = useRouter()
    const token = useAuthStore((s) => s.token)
    const _hasHydrated = useAuthStore((s) => s._hasHydrated)
    const [mounted, setMounted] = useState(false)

    const [successOpen, setSuccessOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const form = useForm<TemplateFormData>({
        defaultValues: {
            name: '',
            type: 'email',
            html: '',
            placeholders: []
        }
    })

    useEffect(() => {
        if (!_hasHydrated) return
        if (!token) {
            router.push('/auth/login')
            return
        }
        setMounted(true)
    }, [_hasHydrated, token])

    const onSubmit = async (data: TemplateFormData) => {
        if (!isValidHtml(data.html) && !isValidMarkdown(data.html)) {
            setErrorMessage("The content must be valid HTML or Markdown. Please check your input.");
            setErrorOpen(true);
            return;
        }
        try {
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (!res.ok) {
                setErrorMessage(result.message || result.error || 'Unexpected error')
                setErrorOpen(true)
                return
            }

            setSuccessOpen(true)
            setTimeout(() => {
                router.push('/templates')
            }, 4000)
        } catch (err) {
            console.error('Create template error:', err)
            setErrorMessage('Network error')
            setErrorOpen(true)
        }
    }

    if (!mounted) {
        return <LoadingSpinner/>
    }

    const md = new MarkdownIt()
    const rawContent = (form.watch("html") as string) || ""
    const isHtml = rawContent && isValidHtml(rawContent)
    const renderedHtml = isHtml
        ? rawContent
        : md.render(rawContent)

    const sanitizedHtml = DOMPurify.sanitize(renderedHtml, {
        ALLOWED_ATTR: ['style', 'href', 'target'],
        ALLOWED_TAGS: [
            'a', 'p', 'h1', 'h2', 'h3', 'ul', 'li', 'strong', 'em', 'div', 'span', 'br', 'hr',
            'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'b', 'i'
        ],
    })
    return (
        <div className="container mx-auto py-6 lg:px-36 lx:px-44 md:px-28 sm:px-20 px-8 transition-all duration-300 ease-in-out">
            <BreadcrumbHeader backHref="/templates" title="Create New Template"/>

            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <div>
                    <TemplateForm form={form} onSubmitAction={onSubmit} buttonText={"Create Template"}/>
                </div>

                <div className="border rounded-md bg-white p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground mb-2">Live Email Preview</p>
                    <div
                        style={{
                            backgroundColor: "#fff",
                            color: "#000",
                            minHeight: "300px",
                            padding: "20px",
                            fontFamily: "Arial, sans-serif",
                        }}
                        dangerouslySetInnerHTML={{__html: sanitizedHtml}}
                    />
                </div>
            </div>

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Template Created"
                description="Your template has been created successfully."
                confirmLabel="Go to Templates"
                onConfirmAction={() => router.push('/templates')}
                onOpenChangeAction={setSuccessOpen}
            />

            <CustomAlertDialog
                open={errorOpen}
                type="error"
                title="Error"
                description={errorMessage}
                confirmLabel="OK"
                onConfirmAction={() => setErrorOpen(false)}
                onOpenChangeAction={setErrorOpen}
            />
        </div>
    )
}
