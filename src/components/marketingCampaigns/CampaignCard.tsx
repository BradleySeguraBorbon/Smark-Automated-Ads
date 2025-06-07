import Link from "next/link";
import React from "react";
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
import { TagIcon, Trash2 } from 'lucide-react'
import { IMarketingCampaign } from "@/types/MarketingCampaign";
import { format } from 'date-fns';
import { useState } from "react";
import CustomAlertDialog from "../CustomAlertDialog";

interface CampaignCardProps {
    campaign: IMarketingCampaign;
    onDelete: () => void;
    userRole: string;
}

const CampaignCardComponent = ({ campaign, onDelete, userRole }: CampaignCardProps) => {

    const [alertOpen, setAlertOpen] = useState(false);

    const totalEmailsOpened = campaign.performance?.totalEmailsOpened ?? 0,
        telegramMessagesOpened = campaign.performance?.telegramMessagesOpened ?? 0,
        totalEmailsSent = campaign.performance?.totalEmailsSent ?? 0,
        telegramMessagesSent = campaign.performance?.telegramMessagesSent ?? 0;

    const openRate = ((totalEmailsOpened + telegramMessagesOpened) * 100) / (totalEmailsSent + telegramMessagesSent || 1);

    return (
        <>
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
                        {userRole !== 'employee' &&
                            <Button variant="secondary" className="bg-teal-600 hover:bg-teal-800" size="icon" onClick={() => setAlertOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        }
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                        <div className="flex flex-wrap gap-2 mt-2">
                            {campaign.tags.length > 0 ? (
                                campaign.tags.slice(0, 5).map((tag) => (
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
                            <span className="font-medium">
                                {campaign.audienceCount !== undefined ? `${campaign.audienceCount} clients` : '...'}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Success-Sent Rate: </span>
                            <span className="font-medium">{openRate}%</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex gap-2">
                        <Button variant="default" className="bg-slate-600 hover:bg-slate-800 text-white" size="sm" asChild>
                            <Link href={`/marketingCampaigns/${campaign._id}`}>View Details</Link>
                        </Button>
                        {["active", "inactive"].includes(campaign.status) && userRole !== 'employee' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-800 text-white" asChild>
                                <Link href={`/marketingCampaigns/${campaign._id}/edit`}>Edit Campaign</Link>
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
            <CustomAlertDialog
                open={alertOpen}
                type="warning"
                title="Delete MarketingCampaign"
                description={'Are you sure you want to delete "${tag.name}"? This action cannot be undone.'}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirmAction={onDelete}
                onCancelAction={() => setAlertOpen(false)}
                onOpenChangeAction={setAlertOpen}
            />
        </>

    )
}

export const CampaignCard = React.memo(CampaignCardComponent);
