'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ClientRef } from '@/types/Client'
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import PaginationControls from '@/components/PaginationControls'

interface AudienceCardProps {
    audience: ClientRef[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function CampaignAudienceCard({ audience, currentPage, totalPages, onPageChange }: AudienceCardProps) {
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
                                <TableRow key={String(client._id)}>
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
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => onPageChange(page)}
                    />
                )}
            </CardContent>
        </Card>
    )
}
