'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Paperclip, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { EmailPreview } from '@/components/adMessages/forms/EmailPreview';
import { IAdMessage } from '@/types/AdMessage';
import { ITemplate } from '@/types/Template';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceholderInputs } from '@/components/adMessages/forms/PlaceholderInputs';
import { extractPlaceholderValues } from '@/lib/parsePlaceholders';

interface EmailContentTabProps {
  form: ReturnType<typeof useFormContext<IAdMessage>>;
  mode: 'new' | 'edit';
  templates: ITemplate[];
  placeholderValues: Record<string, string>;
  setPlaceholderValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function EmailContentTab({ form, mode, templates, placeholderValues, setPlaceholderValues }: EmailContentTabProps) {
  const selectedTemplateRef = form.watch('content.email.template');
  const emailSubject = form.watch('content.email.subject');
  const attachments = form.watch('attachments') || [];

  const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | null>(null);
  const [newAttachmentName, setNewAttachmentName] = useState<string>('');
  const [newAttachmentPath, setNewAttachmentPath] = useState<string>('');

  const generateHtmlFromTemplate = (html: string, values: Record<string, string>): string => {
    return html.replace(/{(\w+?)}/g, (_, key) => values[key] || '________');
  };

  useEffect(() => {
    const tpl = templates.find((t) => t._id === selectedTemplateRef?._id);
    setSelectedTemplate(tpl || null);

    if (tpl) {
      const body = form.getValues('content.email.body');
      if (mode === 'edit' && body) {
        const values = extractPlaceholderValues(tpl.html, body);
        setPlaceholderValues(values);
      } else if (Object.keys(placeholderValues).length === 0) {
        const emptyValues: Record<string, string> = {};
        tpl.placeholders.forEach((key) => (emptyValues[key] = ''));
        setPlaceholderValues(emptyValues);
      }
    }
  }, [selectedTemplateRef]);

  useEffect(() => {
    if (selectedTemplate) {
      const html = generateHtmlFromTemplate(selectedTemplate.html, placeholderValues);
      form.setValue('content.email.body', html);
    }
  }, [placeholderValues, selectedTemplate]);

  const addAttachment = () => {
    if (newAttachmentName && newAttachmentPath) {
      form.setValue('attachments', [
        ...attachments,
        { name: newAttachmentName, path: newAttachmentPath },
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
        <FormField
          control={form.control}
          name="content.email.subject"
          rules={{ required: 'Email subject is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Subject</FormLabel>
              <FormControl>
                <Input id="subject" placeholder="Enter email subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content.email.template"
          rules={{ required: 'MarketingCampaign is required' }}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Email Template</FormLabel>
              <Select
                onValueChange={(id) => {
                  const selected = templates.find((t) => t._id === id);
                  if (selected) {
                    form.setValue('content.email.template', selected as TemplateRef);
                  }
                }}
                value={form.watch('content.email.template')?._id}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.filter(t => t.type === "email")
                    .map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedTemplate ? (
          <PlaceholderInputs
            placeholders={selectedTemplate.placeholders}
            values={placeholderValues}
            onChange={(key, val) =>
              setPlaceholderValues((prev) => ({ ...prev, [key]: val }))
            }
          />
        ) : (
          <div className="p-4 border rounded-md bg-muted/50 text-center">
            Please select an email template to see content fields
          </div>
        )}

        <div>
          <FormLabel>Attachments</FormLabel>
          <div className="flex flex-wrap gap-2 mb-4 mt-2">
            {attachments.map((attachment: { name: string; path: string }, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-2 px-2 py-1">
                <Paperclip className="h-3 w-3" />
                <span className="text-xs">{attachment.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment)}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
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
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {selectedTemplate && (
          <div>
            <h3 className="font-medium mb-1">Email Preview</h3>
            <EmailPreview />
          </div>
        )}

      </CardContent>
    </Card >
  );
}
