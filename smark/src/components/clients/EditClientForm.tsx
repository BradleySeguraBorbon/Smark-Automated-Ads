"use client"

import { UseFormReturn } from "react-hook-form"
import { IClient } from "@/types/Client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import ClientInfoFields from "@/components/clients/ClientInfoFields"
import TagsField from "@/components/clients/TagsField"
import { ITag } from "@/types/Tag"

interface EditClientFormProps {
    form: UseFormReturn<IClient>
    onSubmit: (data: IClient) => void
    tags: ITag[]
    router: any
}

export default function EditClientForm({ form, onSubmit, tags, router }: EditClientFormProps) {
    return (
        <Card>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
