import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PerformanceCard } from '@/components/marketingCampaigns/PerformanceCard'
import { Performance } from '@/types/MarketingCampaign'
import { Mail, MessageSquare, BarChart3, PieChart, Check } from 'lucide-react'

export default function CampaignPerformanceCard({ performance } : { performance: Performance }) {
    const emailOpenRate = performance.totalEmailsSent > 0
        ? (performance.totalEmailsOpened / performance.totalEmailsSent) * 100
        : 0;

    const telegramOpenRate = performance.telegramMessagesSent > 0
            ? (performance.telegramMessagesOpened / performance.telegramMessagesSent) * 100
            : 0

    const totalSent = performance.totalEmailsSent + performance.telegramMessagesSent
    const totalOpened = performance.totalEmailsOpened + performance.telegramMessagesOpened
    const generalOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Track open rates and engagement across channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PerformanceCard
                        title="Email Open Rate"
                        icon={<Mail className="h-5 w-5" />}
                        rate={emailOpenRate}
                        sent={performance.totalEmailsSent}
                        opened={performance.totalEmailsOpened}
                    />

                    <PerformanceCard
                        title="Telegram Open Rate"
                        icon={<MessageSquare className="h-5 w-5" />}
                        rate={telegramOpenRate}
                        sent={performance.telegramMessagesSent}
                        opened={performance.telegramMessagesOpened}
                    />

                    <PerformanceCard
                        title="General Open Rate"
                        icon={<BarChart3 className="h-5 w-5" />}
                        rate={generalOpenRate}
                        sent={totalSent}
                        opened={totalOpened}
                        isGeneral={true}
                    />
                </div>

                <div className="mt-6 p-4 border rounded-md bg-gray-200 dark:bg-[#171717]">
                    <div className="flex items-center gap-2 mb-2">
                        <PieChart className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-medium">Performance Insights</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
                                {generalOpenRate > 40
                                    ? "Excellent engagement rates across channels"
                                    : generalOpenRate > 20
                                        ? "Good engagement rates, with room for improvement"
                                        : "Consider optimizing your content for better engagement"}
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
                                {emailOpenRate > telegramOpenRate
                                    ? "Email is performing better than Telegram for this campaign"
                                    : "Telegram is performing better than Email for this campaign"}
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
                                {totalSent > 1000
                                    ? "High reach campaign with significant audience coverage"
                                    : "Consider expanding your audience for greater impact"}
                            </span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}