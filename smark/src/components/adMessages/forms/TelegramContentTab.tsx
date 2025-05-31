'use client'

import {useFormContext, UseFormReturn} from 'react-hook-form'
import {useEffect, useMemo, useState} from 'react'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import {Card, CardContent} from '@/components/ui/card'
import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {X, Plus, Link2, Sparkles} from 'lucide-react'
import {Label} from '@/components/ui/label'
import {IAdMessage} from '@/types/AdMessage'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {PlaceholderInputs} from '@/components/adMessages/forms/PlaceholderInputs'
import {extractPlaceholderValues} from '@/lib/parsePlaceholders'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import {TemplateRef} from "@/types/Template";
import {Templates} from "@/models/models";
import {AdMessageFormData} from "@/types/forms/AdMessageFormData";

const md = new MarkdownIt()

interface TelegramContentTabProps {
    form: UseFormReturn<AdMessageFormData, any, AdMessageFormData>;
    mode: 'new' | 'edit';
    templates: TemplateRef[];
    placeholderValues: Record<string, string>;
    setPlaceholderValuesAction: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    token: string;
}

export function TelegramContentTab({
                                       form,
                                       mode,
                                       templates,
                                       placeholderValues,
                                       setPlaceholderValuesAction,
                                       token,
                                   }: TelegramContentTabProps) {
    const selectedTemplateRef = form.watch('content.telegram.template')
    const telegramButtons = form.watch('content.telegram.buttons') || []
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateRef | null>(null)
    const [newButtonText, setNewButtonText] = useState('')
    const [newButtonUrl, setNewButtonUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({open: false, type: 'info', title: '', description: ''})

    useEffect(() => {
        const tpl = templates.find((t) => t._id === selectedTemplateRef?._id)
        setSelectedTemplate(tpl || null)
        if (tpl) {
            const message = form.getValues('content.telegram.message')
            if (mode === 'edit' && message) {
                const values = extractPlaceholderValues(tpl.html, message)
                setPlaceholderValuesAction(values)
            } else if (Object.keys(placeholderValues).length === 0) {
                const emptyValues: Record<string, string> = {}
                tpl.placeholders.forEach((key) => (emptyValues[key] = ''))
                setPlaceholderValuesAction(emptyValues)
            }
        }
    }, [selectedTemplateRef])

    useEffect(() => {
        if (selectedTemplate) {
            const message = selectedTemplate.html.replace(/{(\w+?)}/g, (_, key) => placeholderValues[key] || '')
            form.setValue('content.telegram.message', message)
        }
    }, [placeholderValues, selectedTemplate, form])

    const handleAIPlaceholders = async () => {
        const name = form.getValues('name')
        const campaignId = form.getValues('marketingCampaign')
        const type = form.getValues('type')

        if (!name || !campaignId || !type.includes('telegram') || !selectedTemplateRef?._id) {
            setAlert({
                open: true,
                type: 'error',
                title: 'Missing fields',
                description: 'Please ensure you selected a campaign, template and message name.',
            })
            return
        }

        try {
            setLoading(true)
            console.log('Sending token: ', token);
            const res = await fetch('/api/chat/analyzePlaceholders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channel: 'telegram',
                    messageName: name,
                    marketingCampaignId: campaignId._id,
                    templateId: selectedTemplateRef._id,
                    token,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to generate placeholders.')

            setPlaceholderValuesAction(data.placeholders)
            setAlert({
                open: true,
                type: 'success',
                title: 'Generated Successfully',
                description: 'The placeholders were filled by the assistant.',
            })
        } catch (err: any) {
            setAlert({
                open: true,
                type: 'error',
                title: 'AI Error',
                description: err.message,
            })
        } finally {
            setLoading(false)
        }
    }

    const addButton = () => {
        if (!newButtonText || !newButtonUrl) return
        const updated = [...telegramButtons, {text: newButtonText.trim(), url: newButtonUrl.trim()}]
        form.setValue('content.telegram.buttons', updated)
        setNewButtonText('')
        setNewButtonUrl('')
    }

    const removeButton = (text: string) => {
        const updated = telegramButtons.filter((btn: any) => btn.text !== text)
        form.setValue('content.telegram.buttons', updated)
    }

    const renderedMarkdown = useMemo(() => {
        const raw = form.watch('content.telegram.message') || ''
        return DOMPurify.sanitize(md.render(raw))
    }, [form.watch('content.telegram.message')])

    return (
        <Card>
            <CardContent className="pt-2 space-y-6">
                <CustomAlertDialog
                    open={alert.open}
                    type={alert.type as any}
                    title={alert.title}
                    description={alert.description}
                    onOpenChangeAction={(open) => setAlert((prev) => ({...prev, open}))}
                    onConfirmAction={() => setAlert((prev) => ({...prev, open: false}))}
                />

                <FormField
                    control={form.control}
                    name="content.telegram.template"
                    render={() => (
                        <FormItem className="w-full">
                            <FormLabel>Telegram Template</FormLabel>
                            <Select
                                onValueChange={(id) => {
                                    const selected = templates.find((t) => t._id === id)
                                    if (selected) {
                                        form.setValue('content.telegram.template', selected)
                                    }
                                }}
                                value={selectedTemplateRef?._id}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select template"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {templates.filter(t => t.type === 'telegram').map((tpl) => (
                                        <SelectItem key={tpl._id} value={tpl._id}>
                                            {tpl.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                {selectedTemplate && (
                    <div className="space-y-4">
                        <Button variant="outline" size="sm" onClick={handleAIPlaceholders} disabled={loading}>
                            <Sparkles className="w-4 h-4 mr-2 animate-pulse"/>
                            {loading ? 'Generating...' : 'Generate Placeholders'}
                        </Button>

                        <PlaceholderInputs
                            placeholders={selectedTemplate.placeholders}
                            values={placeholderValues}
                            onChange={(key, val) =>
                                setPlaceholderValuesAction((prev) => ({...prev, [key]: val}))
                            }
                        />
                    </div>
                )}

                <div>
                    <Label>Buttons</Label>
                    <div className="flex flex-wrap gap-2 mb-2 mt-1">
                        {telegramButtons.map((button: any, index: number) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {button.text}
                                <span className="text-xs text-muted-foreground ml-1">
                  ({button.url.substring(0, 15)}{button.url.length > 15 ? '...' : ''})
                </span>
                                <button type="button" onClick={() => removeButton(button.text)}>
                                    <X className="h-3 w-3"/>
                                </button>
                            </Badge>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label htmlFor="buttonText" className="text-xs mb-1">
                                    Button Text
                                </Label>
                                <Input
                                    id="buttonText"
                                    placeholder="Button text"
                                    value={newButtonText}
                                    onChange={(e) => setNewButtonText(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="buttonUrl" className="text-xs mb-1">
                                    Button URL
                                </Label>
                                <Input
                                    id="buttonUrl"
                                    placeholder="https://example.com"
                                    value={newButtonUrl}
                                    onChange={(e) => setNewButtonUrl(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addButton}
                                    disabled={!newButtonText || !newButtonUrl}
                                >
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedTemplate && (
                    <div className="mt-6 p-4 border rounded-md">
                        <h3 className="font-medium mb-2 text-black dark:text-white">Telegram Preview</h3>
                        <div
                            className="bg-gray-100 p-3 rounded-lg max-w-md text-sm  text-black prose prose-sm dark:prose-invert"
                            dangerouslySetInnerHTML={{__html: renderedMarkdown}}/>

                        {telegramButtons.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {telegramButtons.map((button: any, index: number) => (
                                    <Badge key={index} variant="outline"
                                           className="cursor-pointer flex items-center text-muted-foreground gap-1">
                                        {button.text}
                                        <Link2 className="h-3 w-3 ml-1"/>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
