'use client'

import {useState, useEffect} from 'react'
import {useFormContext, UseFormReturn} from 'react-hook-form'
import {IAdMessage} from '@/types/AdMessage'
import {ITemplate} from '@/types/Template'
import {Card, CardContent} from '@/components/ui/card'
import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Paperclip, Plus, X, Sparkles} from 'lucide-react'
import {EmailPreview} from '@/components/adMessages/forms/EmailPreview'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Label} from '@/components/ui/label'
import {PlaceholderInputs} from '@/components/adMessages/forms/PlaceholderInputs'
import {extractPlaceholderValues} from '@/lib/parsePlaceholders'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import {AdMessageFormData} from "@/types/forms/AdMessageFormData";

interface EmailContentTabProps {
    form: UseFormReturn<AdMessageFormData, any, AdMessageFormData>;
    mode: 'new' | 'edit';
    templates: ITemplate[];
    placeholderValues: Record<string, string>;
    token:string;
    setPlaceholderValuesAction: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function EmailContentTab({
                                    form,
                                    mode,
                                    templates,
                                    placeholderValues,
                                    token,
                                    setPlaceholderValuesAction
                                }: EmailContentTabProps) {
    const selectedTemplateRef = form.watch('content.email.template');
    const emailSubject = form.watch('content.email.subject');
    const attachments = form.watch('attachments') || [];
    const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | null>(null)
    const [newAttachmentName, setNewAttachmentName] = useState<string>('')
    const [newAttachmentPath, setNewAttachmentPath] = useState<string>('')
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({open: false, type: 'info', title: '', description: ''});

    const generateHtmlFromTemplate = (html: string, values: Record<string, string>) =>
        html.replace(/{(\w+?)}/g, (_, key) => values[key] || '________')

    useEffect(() => {
        const tpl = templates.find((t) => t._id === selectedTemplateRef?._id);
        setSelectedTemplate(tpl || null);

        if (tpl) {
            const body = form.getValues('content.email.body');
            if (mode === 'edit' && body) {
                const values = extractPlaceholderValues(tpl.html, body);
                setPlaceholderValuesAction(values);
            } else if (Object.keys(placeholderValues).length === 0) {
                const emptyValues: Record<string, string> = {};
                tpl.placeholders.forEach((key) => (emptyValues[key] = ''));
                setPlaceholderValuesAction(emptyValues);
            }
        }
    }, [selectedTemplateRef]);

    useEffect(() => {
        if (selectedTemplate) {
            const html = generateHtmlFromTemplate(selectedTemplate.html, placeholderValues);
            form.setValue('content.email.body', html);
        }
    }, [placeholderValues, selectedTemplate]);

    const handleAIPlaceholders = async () => {
        const name = form.getValues('name')
        const campaignId = form.getValues('marketingCampaign')
        const type = form.getValues('type')

        if (!name || !campaignId || !type.includes('email') || !selectedTemplateRef?._id) {
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
            const res = await fetch('/api/chat/analyzePlaceholders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channel: 'email',
                    messageName: name,
                    marketingCampaignId: campaignId._id,
                    templateId: selectedTemplateRef._id,
                    token,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to generate placeholders.')

            setPlaceholderValuesAction(data.placeholders)
            form.setValue('content.email.subject', data.subject)
            setAlert({
                open: true,
                type: 'success',
                title: 'Generated Successfully',
                description: 'The placeholders and subject were filled by the assistant.',
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

    const addAttachment = () => {
        if (newAttachmentName && newAttachmentPath) {
            form.setValue('attachments', [
                ...attachments,
                {name: newAttachmentName, path: newAttachmentPath},
            ]);
            setNewAttachmentName('');
            setNewAttachmentPath('');
        }
    }

    const removeAttachment = (toRemove: { name: string; path: string }) => {
        const updated = attachments.filter(
            (att: { name: string; path: string }) =>
                att.name !== toRemove.name || att.path !== toRemove.path
        );
        form.setValue('attachments', updated);
    };

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
                    name="content.email.subject"
                    rules={{required: 'Email subject is required'}}
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email Subject</FormLabel>
                            <FormControl>
                                <Input id="subject" placeholder="Enter email subject" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content.email.template"
                    rules={{required: 'Template is required'}}
                    render={() => (
                        <FormItem className="w-full">
                            <FormLabel>Email Template</FormLabel>
                            <Select
                                onValueChange={(id) => {
                                    const selected = templates.find((t) => t._id === id)
                                    if (selected) {
                                        form.setValue('content.email.template', selected)
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
                                    {templates.filter(t => t.type === 'email').map((tpl) => (
                                        <SelectItem key={String(tpl._id)} value={String(tpl._id)}>
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
                    <FormLabel>Attachments</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-4 mt-2">
                        {attachments.map((attachment: { name: string; path: string }, index: number) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-2 px-2 py-1">
                                <Paperclip className="h-3 w-3"/>
                                <span className="text-xs">{attachment.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(attachment)}
                                    className="ml-1"
                                >
                                    <X className="h-3 w-3"/>
                                </button>
                            </Badge>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label htmlFor="attachmentName" className="text-xs">
                                    File Name
                                </Label>
                                <Input
                                    id="attachmentName"
                                    placeholder="document.pdf"
                                    value={newAttachmentName}
                                    className="mt-1"
                                    onChange={(e) => setNewAttachmentName(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="attachmentPath" className="text-xs">
                                    File Path/URL
                                </Label>
                                <Input
                                    id="attachmentPath"
                                    placeholder="/files/document.pdf"
                                    value={newAttachmentPath}
                                    className="mt-1"
                                    onChange={(e) => setNewAttachmentPath(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addAttachment}
                                    disabled={!newAttachmentName || !newAttachmentPath}
                                >
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedTemplate && (
                    <div>
                        <h3 className="font-medium mb-1">Email Preview</h3>
                        <EmailPreview/>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
