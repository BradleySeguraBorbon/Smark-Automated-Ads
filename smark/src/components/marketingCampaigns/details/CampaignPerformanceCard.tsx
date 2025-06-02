import {useMemo} from 'react'
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card'
import {PerformanceCard} from '@/components/marketingCampaigns/PerformanceCard'
import {Mail, MessageSquare, BarChart3, PieChart, Check} from 'lucide-react'
import {Pie} from 'react-chartjs-2'
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import MessageSentLineChart from '@/components/marketingCampaigns/details/MessageSentLineChart'
import {SuccessSentData} from '@/types/SuccessSentData'
import {ClientRef} from "@/types/Client";

ChartJS.register(ArcElement, Tooltip, Legend)

interface CampaignPerformanceCardProps {
    campaignId: string;
    audience: ClientRef[];
    successData: SuccessSentData | null;
}

export default function CampaignPerformanceCard({
                                                    campaignId,
                                                    audience,
                                                    successData
                                                }: CampaignPerformanceCardProps) {
    const emailRate = successData?.email.total
        ? (successData.email.sent / successData.email.total) * 100
        : 0;

    const telegramRate = successData?.telegram.total
        ? (successData.telegram.sent / successData.telegram.total) * 100
        : 0;

    const generalRate = successData?.general.total
        ? (successData.general.sent / successData.general.total) * 100
        : 0;

    const {ageGroups, contactPrefs} = useMemo(() => {
        const ageGroups = {
            '18-24': 0,
            '25-34': 0,
            '35-44': 0,
            '45-54': 0,
            '55+': 0
        }
        const contactPrefs = {email: 0, telegram: 0}

        audience.forEach(({birthDate, preferredContactMethod}) => {
            const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
            if (age >= 18 && age <= 24) ageGroups['18-24']++
            else if (age <= 34) ageGroups['25-34']++
            else if (age <= 44) ageGroups['35-44']++
            else if (age <= 54) ageGroups['45-54']++
            else ageGroups['55+']++

            if (preferredContactMethod === 'email') contactPrefs.email++
            else if (preferredContactMethod === 'telegram') contactPrefs.telegram++
        })

        return {ageGroups, contactPrefs}
    }, [audience])

    if (!successData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>No data available for this campaign yet.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                    Track successful sent rates to check the correct AdMessage sending through both email
                    and telegram platforms
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PerformanceCard
                        title="Email Successful Sent Rate"
                        icon={<Mail className="h-5 w-5" />}
                        rate={emailRate}
                        total={successData?.email.total}
                        sent={successData.email.sent}
                    />
                    <PerformanceCard
                        title="Telegram Successful Sent Rate"
                        icon={<MessageSquare className="h-5 w-5" />}
                        rate={telegramRate}
                        total={successData.telegram.total}
                        sent={successData.telegram.sent}
                    />
                    <PerformanceCard
                        title="General Successful Sent Rate"
                        icon={<BarChart3 className="h-5 w-5" />}
                        rate={generalRate}
                        total={successData.general.total}
                        sent={successData.general.sent}
                        isGeneral={true}
                    />
                </div>

                <div className="mt-6 p-4 border rounded-md bg-gray-200 dark:bg-[#171717]">
                    <div className="flex items-center gap-2 mb-2">
                        <PieChart className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-medium">Delivery Performance Insights</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
              {generalRate > 90
                  ? "Excellent delivery success across channels"
                  : generalRate > 70
                      ? "Good delivery performance, with minor delivery losses"
                      : "Consider reviewing failed deliveries and improving your campaign setup"}
            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
              {emailRate > telegramRate
                  ? "Email achieved higher delivery success than Telegram"
                  : "Telegram achieved higher delivery success than Email"}
            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>
              {successData?.general.total > 1000
                  ? "This campaign has reached a large audience with substantial message volume"
                  : "Consider increasing your audience size to expand campaign reach"}
            </span>
                        </li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border rounded-md p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="min-h-[300px]">
                        <h4 className="font-medium mb-4 text-center">Age Distribution</h4>
                        <div className="relative h-[250px]">
                            <Pie
                                data={{
                                    labels: Object.keys(ageGroups),
                                    datasets: [
                                        {
                                            data: Object.values(ageGroups),
                                            backgroundColor: ['#f87171', '#facc15', '#34d399', '#60a5fa', '#a78bfa'],
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } },
                                }}
                            />
                        </div>
                    </div>

                    <div className="min-h-[300px]">
                        <h4 className="font-medium mb-4 text-center">Preferred Contact Method</h4>
                        <div className="relative h-[250px]">
                            <Pie
                                data={{
                                    labels: ['Email', 'Telegram'],
                                    datasets: [
                                        {
                                            data: [contactPrefs.email, contactPrefs.telegram],
                                            backgroundColor: ['#3b82f6', '#22c55e'],
                                            borderRadius: 5,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } },
                                }}
                            />
                        </div>
                    </div>
                </div>
                <MessageSentLineChart campaignId={campaignId}/>
            </CardContent>
        </Card>
    )
}