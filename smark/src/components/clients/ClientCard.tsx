"use client"

import {IClient} from "@/types/Client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Trash2, Pencil, Eye} from "lucide-react"
import Link from "next/link"
import CustomAlertDialog from "@/components/CustomAlertDialog"
import {useState} from "react";

interface ClientCardProps {
    client: IClient
    onDeleteAction: (id: string) => void
    isLoading: boolean
    userRole: string
}

export default function ClientCard({client, onDeleteAction, isLoading, userRole}: ClientCardProps) {
    const [alertOpen, setAlertOpen] = useState(false)

    const handleDelete = () => {
        onDeleteAction(client._id as string)
        setAlertOpen(false)
    }

    return (
        <>
            <Card className="relative hover:shadow-md transition-shadow dark:bg-">
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>
                            {client.firstName} {client.lastName}
                        </CardTitle>
                    </div>
                    <div className="flex gap-2">
                        {userRole !== 'employee' && <Link href={`/clients/${client._id}/edit`}>
                            <Button className="bg-blue-500 hover:bg-blue-800" variant="secondary" size="icon">
                                <Pencil className="h-4 w-4"/>
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>}
                        {userRole !== 'employee' && <Link href={`/clients/${client._id}`}>
                            <Button variant="default" className="bg-slate-600" size="icon">
                                <Eye className="h-4 w-4"/>
                                <span className="sr-only">View</span>
                            </Button>
                        </Link>}
                        {userRole !== 'employee' && <Button
                            className={"bg-red-500 hover:bg-red-800"}
                            variant="secondary"
                            size="icon"
                            onClick={() => setAlertOpen(true)}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4"/>
                            <span className="sr-only">Delete</span>
                        </Button>}
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="font-medium">Email:</span> {client.email}
                        </p>
                        <p className="text-sm">
                            <span className="font-medium">Phone:</span> {client.phone}
                        </p>
                        <p className="text-sm">
                            <span className="font-medium">Telegram:</span> {client.telegramChatId}
                        </p>
                        <p className="text-sm">
                            <span className="font-medium">Subscriptions:</span> {client.subscriptions.join(", ")}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <CustomAlertDialog
                open={alertOpen}
                type="warning"
                title="Confirm deletion."
                description={`Are you sure you want to delete ${client.firstName} ${client.lastName}? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirmAction={handleDelete}
                onCancelAction={() => setAlertOpen(false)}
                onOpenChangeAction={setAlertOpen}
            />
        </>
    )
}