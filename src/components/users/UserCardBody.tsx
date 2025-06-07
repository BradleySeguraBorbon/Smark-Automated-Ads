'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IUser } from '@/types/User'
import { ReactNode } from 'react'

interface Props {
    user: IUser
    children?: ReactNode
}

export default function UserCardBody({ user, children }: Props) {
    return (
        <Card className="relative hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row justify-between items-start">
                <CardTitle>{user.username}</CardTitle>
                <div className="flex gap-2">{children}</div>
            </CardHeader>

            <CardContent>
                <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Role:</span> {user.role}</p>
                    {user.marketingCampaigns.length > 0 && (
                        <p>
                            <span className="font-medium">Marketing Campaigns:</span>{' '}
                            {user.marketingCampaigns.map((mc) => mc._id).join(', ')}
                        </p>
                    )}
                    <p className="text-muted-foreground">
                        Created At: {new Date(user.createdAt!).toLocaleString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
