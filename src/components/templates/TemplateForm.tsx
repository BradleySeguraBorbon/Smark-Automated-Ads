'use client'

import {UseFormReturn} from 'react-hook-form'
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group'
import {Button} from '@/components/ui/button'
import PlaceholdersInput from "@/components/templates/PlaceholdersInputs";
import {TemplateFormData} from "@/types/forms";

interface TemplateFormProps {
    form: UseFormReturn<TemplateFormData>
    onSubmitAction: (data: TemplateFormData) => void
    buttonText: string
}

export default function TemplateForm({form, onSubmitAction, buttonText}: TemplateFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    rules={{required: 'Template name is required'}}
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Welcome Email" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    rules={{required: 'Template type is required'}}
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                                <RadioGroup defaultValue={field.value} onValueChange={field.onChange}
                                            className="flex gap-4">
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <RadioGroupItem value="email"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">Email</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <RadioGroupItem value="telegram"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">Telegram</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="html"
                    rules={{
                        required: 'HTML content is required',
                        minLength: {
                            value: 30,
                            message: "Password must have at least 30 characters"
                        }
                    }}
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>HTML or Markdown</FormLabel>
                            <FormControl>
                                <Textarea rows={10} className="max-h-[400px] overflow-y-auto" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="placeholders"
                    render={({field}) => <PlaceholdersInput field={field}/>}
                />

                <div className="flex justify-end">
                    <Button variant="secondary" className="bg-purple-700 hover:bg-purple-900" type="submit">{buttonText}</Button>
                </div>
            </form>
        </Form>
    )
}
