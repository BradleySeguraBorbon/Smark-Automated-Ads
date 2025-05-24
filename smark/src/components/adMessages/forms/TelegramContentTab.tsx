'use client'

import { useFormContext } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Link2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { IAdMessage } from '@/types/AdMessage'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlaceholderInputs } from '@/components/adMessages/forms/PlaceholderInputs'
import { extractPlaceholderValues } from '@/lib/parsePlaceholders';


interface TelegramContentTabProps {
  form: ReturnType<typeof useFormContext<IAdMessage>>;
  mode: 'new' | 'edit';
  templates: TemplateRef[];
  placeholderValues: Record<string, string>;
  setPlaceholderValuesAction: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function TelegramContentTab({ form, mode, templates, placeholderValues, setPlaceholderValuesAction }: TelegramContentTabProps) {
  const selectedTemplateRef = form.watch('content.telegram.template');
  const telegramButtons = form.watch('content.telegram.buttons') || [];

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newButtonText, setNewButtonText] = useState('');
  const [newButtonUrl, setNewButtonUrl] = useState('');

  const generateTelegramMessage = (html: string, values: Record<string, string>) => {
    return html.replace(/{(\w+?)}/g, (_, key) => values[key] || '');
  };

  useEffect(() => {
    const tpl = templates.find((t) => t._id === selectedTemplateRef?._id);
    setSelectedTemplate(tpl || null);
    if (tpl) {
      const message = form.getValues('content.telegram.message');
      if (mode === 'edit' && message) {
        const values = extractPlaceholderValues(tpl.html, message);
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
      const message = generateTelegramMessage(selectedTemplate.html, placeholderValues);
      form.setValue('content.telegram.message', message);
    }
  }, [placeholderValues, selectedTemplate, form]);

  const addButton = () => {
    if (!newButtonText || !newButtonUrl) return
    const updated = [...telegramButtons, { text: newButtonText.trim(), url: newButtonUrl.trim() }]
    form.setValue('content.telegram.buttons', updated)
    setNewButtonText('')
    setNewButtonUrl('')
  }

  const removeButton = (text: string) => {
    const updated = telegramButtons.filter((btn: any) => btn.text !== text)
    form.setValue('content.telegram.buttons', updated)
  }

  return (
    <Card >
      <CardContent className="pt-2 space-y-6">
        <FormField
          control={form.control}
          name="content.telegram.template"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Telegram Template</FormLabel>
              <Select
                onValueChange={(id) => {
                  const selected = templates.find((t) => t._id === id);
                  if (selected) {
                    form.setValue('content.telegram.template', selected as TemplateRef);
                  }
                }}
                value={form.watch('content.telegram.template')?._id}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.filter(t => t.type === "telegram").map((tpl) => (
                    <SelectItem key={tpl._id} value={tpl._id}>
                      {tpl.name}
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
              setPlaceholderValuesAction((prev) => ({ ...prev, [key]: val }))
            }
          />
        ) : (
          <div className="p-4 border rounded-md bg-muted/50 text-center">
            Please select an email template to see content fields
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
                  <X className="h-3 w-3" />
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
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {selectedTemplate && (
          <div className="mt-6 p-4 border rounded-md">
            <h3 className="font-medium mb-2 text-black dark:text-white">Telegram Preview</h3>
            <div className="bg-gray-100 p-3 rounded-lg max-w-md text-sm whitespace-pre-wrap text-muted-foreground">
              {form.watch('content.telegram.message')}
              {telegramButtons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {telegramButtons.map((button: any, index: number) => (
                    <Badge key={index} variant="outline" className="cursor-pointer flex items-center text-muted-foreground gap-1">
                      {button.text}
                      <Link2 className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card >
  )
}
