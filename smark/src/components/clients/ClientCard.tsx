"use client"

import { IClient } from "@/types/Client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Link from "next/link"

interface ClientCardProps {
    client: IClient
    onDelete: (id: string) => void
    isLoading: boolean
}

export default function ClientCard({ client, onDelete, isLoading }: ClientCardProps) {
    return (
        <Card className="relative hover:shadow-md transition-shadow">
            <Link href={`/clients/${client._id}/edit`}>
                <CardHeader>
                    <CardTitle>
                        {client.firstName} {client.lastName}
                    </CardTitle>
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
            </Link>
            <div className="absolute top-2 right-2">
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(client._id as string)}
                    disabled={isLoading}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    )
}
