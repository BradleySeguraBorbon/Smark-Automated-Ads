"use client"

import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {PlusCircle} from "lucide-react"
import Link from "next/link"
import {IClient} from "@/types/Client";

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [apiError, setApiError] = useState<string | null>(null)
    const [fetchedClients, setFetchedClients] = useState([]) // nuevo estado para los clientes

    const fetchClients = async () => {
        try {
            const response = await fetch('/api/clients', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2ODE2YmI0YzcwZDdhNjY4ZGY0ZDc4YTYiLCJ1c2VybmFtZSI6IlNlYmFzdGlhbiIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NDYzOTU1NzUsImV4cCI6MTc0NjM5OTE3NX0.6g2V5CedFUQqZDUqlsMaNbirTz75bxxjuT3LhgG9-NE`
                },
            })

            const result = await response.json()
            console.log('API response:', result)

            if (!response.ok) {
                console.error(result)
                const errorMessage = result.message || result.error || 'Unknown error occurred'
                setApiError(errorMessage)
                return
            }
            setFetchedClients(result.results)
            setApiError(null)
            console.log('Fetched clients:', result.results)

        } catch (error) {
            console.error('Network or unexpected error:', error)
            setApiError('Unexpected error occurred.')
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    const filteredClients = Array.isArray(fetchedClients)
        ? fetchedClients.filter((client: IClient) => {
            const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
            return fullName.includes(searchTerm.toLowerCase())
        })
        : []

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Client Management</h1>
                <Link href="/clients/create">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add New Client
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search clients..."
                    className="w-full p-2 border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {apiError && (
                <div className="text-center py-4 text-red-500">{apiError}</div>
            )}

            {filteredClients.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">No clients found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client: any) => (
                        <Link href={`/clients/${client._id}/edit`} key={client._id}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                                            <span
                                                className="font-medium">Subscriptions:</span> {client.subscriptions.join(", ")}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
