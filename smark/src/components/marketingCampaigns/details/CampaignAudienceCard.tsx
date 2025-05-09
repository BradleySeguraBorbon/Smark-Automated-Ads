'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { IClient } from '@/types/Client'
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import PaginationControls from '@/components/PaginationControls'

export default function CampaignAudienceCard({ campaignId }: { campaignId: string }) {
    const [audience, setAudience] = useState<IClient[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        const fetchAudience = async () => {
            try {
                const res = await fetch(`/api/campaignAudiences?campaignId=${campaignId}&page=${page}&limit=10`, {
                    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}` },
                })
                const data = await res.json()
                if (data.result?.audience) {
                    setAudience(data.result.audience)
                    setTotalPages(data.totalPages || 1)
                }
            } catch (err) {
                console.error('Failed to fetch audience:', err)
                setAudience([])
                setTotalPages(1)
            }
        }

        fetchAudience()
    }, [campaignId, page])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Target Audience</CardTitle>
                <CardDescription>Clients targeted by this campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3 mr-1" />
                        {audience.length} clients
                    </Badge>
                </div>

                <div className="border rounded-md overflow-hidden mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {audience.map((client) => (
                                <TableRow key={ String(client._id)}>
                                    <TableCell>
                                        {client.firstName} {client.lastName}
                                    </TableCell>
                                    <TableCell>{client.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {totalPages > 1 && (
                    <PaginationControls
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                )}
            </CardContent>
        </Card>
    )
}
