"use client"

import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {PlusCircle} from "lucide-react"
import Link from "next/link"
import {IClient} from "@/types/Client"
import ClientsList from "@/components/clients/ClientList"
import SearchInput from "@/components/SearchInput"
import {usePathname} from "next/navigation";
import {Navbar} from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner"

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [apiError, setApiError] = useState<string | null>(null)
    const [fetchedClients, setFetchedClients] = useState<IClient[]>([])
    const [loadingIds, setLoadingIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    const fetchClients = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/clients', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2ODE2YmI0YzcwZDdhNjY4ZGY0ZDc4YTYiLCJ1c2VybmFtZSI6IlNlYmFzdGlhbiIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NDY0MTYyNzgsImV4cCI6MTc0Njc3NjI3OH0.ZOTimuCUNqAQWQgYiz1YJSWL5ly1jYxv753YGnK5EIo`
                },
            })

            const result = await response.json()

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
            console.error('Fetch error:', error)
            setApiError('Unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    const handleDelete = async (clientId: string) => {
        setLoadingIds((prev) => [...prev, clientId])

        try {
            const response = await fetch(`/api/clients/${clientId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2ODE2YmI0YzcwZDdhNjY4ZGY0ZDc4YTYiLCJ1c2VybmFtZSI6IlNlYmFzdGlhbiIsInJvbGUiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NDY0MTYyNzgsImV4cCI6MTc0Njc3NjI3OH0.ZOTimuCUNqAQWQgYiz1YJSWL5ly1jYxv753YGnK5EIo`
                },
            })

            const result = await response.json()

            if (!response.ok) {
                const errorMessage = result.message || result.error || 'Error deleting client.'
                setApiError(errorMessage)
            } else {
                setFetchedClients((prev) => prev.filter((client) => client._id !== clientId))
                setApiError(null)
            }
        } catch (error) {
            console.error('Delete error:', error)
            setApiError('Unexpected error occurred while deleting.')
        } finally {
            setLoadingIds((prev) => prev.filter((id) => id !== clientId))
        }
    }

    const filteredClients = fetchedClients.filter((client) => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
        return fullName.includes(searchTerm.toLowerCase())
    })

    const currentPath = usePathname()
    const routes = [
        { href: "/", label: "Dashboard" },
        { href: "/campaigns", label: "Campaigns" },
        { href: "/adMessages", label: "Ad-Messages" },
        { href: "/clients", label: "Clients" },
        { href: "/analytics", label: "Analytics" },
    ]

    return (
        <div className="container mx-auto py-10">
            <header>
                <Navbar currentPath={currentPath} routes={routes} />
            </header>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Client Management</h1>
                <Link href="/clients/create">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add New Client
                    </Button>
                </Link>
            </div>

            <SearchInput value={searchTerm} onChange={setSearchTerm}/>

            {apiError && (
                <div className="text-center py-4 text-red-500 bg-red-100 rounded-md">{apiError}</div>
            )}

            {loading ? (
                <LoadingSpinner />
            ) : (
                <ClientsList clients={filteredClients} loadingIds={loadingIds} onDelete={handleDelete} />
            )}
        </div>
    )
}
