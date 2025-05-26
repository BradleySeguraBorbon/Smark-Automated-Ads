'use client';

import { IAdMessage } from '@/types/AdMessage';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AdMessageHeaderProps {
    adMessage: IAdMessage;
}

export default function AdMessageHeader({ adMessage }: AdMessageHeaderProps) {
    return (
        <Card className="mb-6 no-hover-effect">
            <CardContent className="pt-1">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge
                            className="mt-1"
                            variant={
                                adMessage.status === 'sent'
                                    ? 'default'
                                    : adMessage.status === 'programmed'
                                        ? 'secondary'
                                        : 'outline'
                            }
                        >
                            {adMessage.status.charAt(0).toUpperCase() + adMessage.status.slice(1)}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Send Date</p>
                        <p className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {format(new Date(adMessage.sendDate), 'MMM d, yyyy')}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Campaign</p>
                        <p className="mt-1">{adMessage.marketingCampaign.name}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
