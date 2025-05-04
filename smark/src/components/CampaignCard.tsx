import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CampaignStatusBadge } from "@/components/CampaignStatusBadge"
import { UsersIcon, PieChartIcon, TagIcon, MoreVertical } from 'lucide-react'
import { IMarketingCampaign } from "@/types/MarketingCampaign";
import { format } from 'date-fns';

interface CampaignCardProps {
    campaign: IMarketingCampaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {

    const totalEmailsOpened = campaign.performance?.totalEmailsOpened ?? 0,
        telegramMessagesOpened = campaign.performance?.telegramMessagesOpened ?? 0,
        totalEmailsSent = campaign.performance?.totalEmailsSent ?? 0,
        telegramMessagesSent = campaign.performance?.telegramMessagesSent ?? 0;

    const openRate = ((totalEmailsOpened + telegramMessagesOpened) * 100) / (totalEmailsSent + telegramMessagesSent || 1);

    return (
        <Card key={campaign.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    <CardDescription>Created on {format(new Date(campaign.startDate), 'yyyy-MM-dd')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            campaign.status === "active" ? "default" : campaign.status === "inactive" ? "outline" : "secondary"
                        }
                    >
                        {campaign.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                    <div className="flex flex-wrap gap-2 mt-2">
                        {campaign.tags.length > 0 ? (
                            campaign.tags.slice(0, 5).map(({ tag }) => (
                                <Badge
                                    key={tag._id.toString()}
                                    variant="outline"
                                    className="flex items-center gap-1 py-1"
                                >
                                    <TagIcon className="h-3 w-3" />
                                    <span>{tag.name}</span>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-muted-foreground">No tags</span>
                        )}
                    </div>
                    <div>
                        <span className="text-muted-foreground">Sent to: </span>
                        <span className="font-medium">{campaign.audiencePreview?.length ?? 0} clients</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Open rate: </span>
                        <span className="font-medium">{openRate}%</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/campaigns/${campaign.id}`}>View Details</Link>
                    </Button>
                    {["active", "inactive"].includes(campaign.status) && (
                        <Button size="sm" asChild>
                            <Link href={`/campaigns/${campaign.id}/edit`}>Edit Campaign</Link>
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}