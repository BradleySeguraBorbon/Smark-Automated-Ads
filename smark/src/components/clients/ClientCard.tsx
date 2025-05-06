"use client"

import { IClient } from "@/types/Client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil } from "lucide-react"
import Link from "next/link"
import CustomAlertDialog from "@/components/CustomAlertDialog"
import {useState} from "react";

interface ClientCardProps {
    client: IClient
    onDelete: (id: string) => void
    isLoading: boolean
}

export default function ClientCard({ client, onDelete, isLoading }: ClientCardProps) {
    const [alertOpen, setAlertOpen] = useState(false)

    const handleDelete = () => {
        onDelete(client._id as string)
        setAlertOpen(false)
    }

    return (
        <>
            <Card className="relative hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>
                            {client.firstName} {client.lastName}
                        </CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/clients/${client._id}/edit`}>
                            <Button variant="secondary" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setAlertOpen(true)}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
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
                title="Confirmar eliminación"
                description={`¿Estás seguro de que querés eliminar a ${client.firstName} ${client.lastName}? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={handleDelete}
                onCancel={() => setAlertOpen(false)}
                onOpenChange={setAlertOpen}
            />
        </>
    )
}