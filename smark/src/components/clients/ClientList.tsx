"use client"

import { IClient } from "@/types/Client"
import ClientCard from "@/components/clients/ClientCard"

interface ClientsListProps {
    clients: IClient[]
    loadingIds: string[]
    onDelete: (id: string) => void
    userRole: string
}

export default function ClientsList({ clients, loadingIds, onDelete, userRole }: ClientsListProps) {
    if (clients.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">No clients found matching your search.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {clients.map((client) => (
                <ClientCard
                    key={String(client._id)}
                    client={client}
                    onDelete={onDelete}
                    isLoading={loadingIds.includes(client._id as string)}
                    userRole={userRole}
                />
            ))}
        </div>
    )
}
