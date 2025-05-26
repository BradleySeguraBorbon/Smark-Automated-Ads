import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { IMarketingCampaign } from '@/types/MarketingCampaign'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'
import { UserRef } from '@/types/User'
import { TagRef } from '@/types/Tag'

export default function CampaignDetailsCard({ campaign }: { campaign: IMarketingCampaign }) {
    return (
        <Card >
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{campaign.description}</p>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {campaign.tags.map((tag: TagRef) => (
                            <Badge key={tag._id} variant="secondary" className="flex items-center gap-1 bg-cyan-600 text-black hover:bg-cyan-700 hover:text-white transition-colors duration-200 ease-in-out">
                                <Tag className="h-3 w-3" />
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-3">Team Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {campaign.users.map((user: UserRef) => (
                            <div key={String(user._id)} className="flex items-center gap-3 p-3 border rounded-md">
                                <Avatar>
                                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{user.username}</p>
                                    <p className="text-sm text-muted-foreground">{user.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
