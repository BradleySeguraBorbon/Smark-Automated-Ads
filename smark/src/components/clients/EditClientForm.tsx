"use client"

import { UseFormReturn } from "react-hook-form"
import { IClient } from "@/types/Client"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import ClientInfoFields from "@/components/clients/ClientInfoFields"
import TagsField from "@/components/clients/TagsField"
import { ITag } from "@/types/Tag"
import {ClientFormFields} from "@/types/forms/ClientForm";

interface EditClientFormProps {
    form: UseFormReturn<ClientFormFields>
    onSubmitAction: (data: IClient) => void
    tags: ITag[]
    router: any
}

export default function EditClientForm({ form, onSubmitAction, tags, router }: EditClientFormProps) {
    return (
        <Card>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-6">
                        <ClientInfoFields form={form} />
                        <TagsField form={form} tagOptions={tags} />
                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/clients")}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>

        </Card>
    )
}
