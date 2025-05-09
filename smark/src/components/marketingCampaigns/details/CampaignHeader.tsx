'use client'

import { IMarketingCampaign } from '@/types/MarketingCampaign'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface CampaignHeaderProps {
  campaign: IMarketingCampaign
}

export default function CampaignHeader({ campaign }: CampaignHeaderProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-1">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge className="mt-1" variant={campaign.status === "active" ? "default" : "secondary"}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Date Range</p>
            <p className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              {campaign.startDate ? format(campaign.startDate, "MMM d, yyyy") : "Not set"}
              {campaign.endDate ? ` - ${format(campaign.endDate, "MMM d, yyyy")}` : ""}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Team</p>
            <p className="mt-1">{campaign.users.length} team members</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}