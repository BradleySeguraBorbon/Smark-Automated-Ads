import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PerformanceCard } from '@/components/marketingCampaigns/PerformanceCard'
import { Performance } from '@/types/MarketingCampaign'
import { Mail, MessageSquare, BarChart3, PieChart, Check } from 'lucide-react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import MessageSentLineChart from '@/components/marketingCampaigns/details/MessageSentLineChart'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ClientData {
    birthDate: string
    preferredContactMethod: string
}

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

    const [clients, setClients] = useState<ClientData[]>([])

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch('/api/clients?page=1&limit=1000')
                const data = await res.json()

                if (!data.results || !Array.isArray(data.results)) return

                const filtered = data.results.map((client: any) => ({
                    birthDate: client.birthDate,
                    preferredContactMethod: client.preferredContactMethod
                })).filter(c => c.birthDate && c.preferredContactMethod)

                setClients(filtered)
            } catch (error) {
                console.error('Failed to fetch clients for chart:', error)
            }
        }

        fetchClients()
    }, [])

    const ageGroups = {
        '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0
    }

    const contactPrefs = { email: 0, telegram: 0 }

    clients.forEach(({ birthDate, preferredContactMethod }) => {
        const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        if (age >= 18 && age <= 24) ageGroups['18-24']++
        else if (age <= 34) ageGroups['25-34']++
        else if (age <= 44) ageGroups['35-44']++
        else if (age <= 54) ageGroups['45-54']++
        else ageGroups['55+']++

        if (preferredContactMethod === 'email') contactPrefs.email++
        else if (preferredContactMethod === 'telegram') contactPrefs.telegram++
    })

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
                {/* 👥 Public Distribution */}
                <div className="grid md:grid-cols-2 border rounded-md gap-6 p-10">
                    <div>
                        <h4 className="font-medium mb-4 text-center">Age Distribution</h4>
                        <Pie
                            data={{
                                labels: Object.keys(ageGroups),
                                datasets: [{
                                    data: Object.values(ageGroups),
                                    backgroundColor: ['#f87171', '#facc15', '#34d399', '#60a5fa', '#a78bfa']
                                }]
                            }}
                            options={{
                                plugins: { legend: { position: 'bottom' } }
                            }}
                        />
                    </div>

                    <div>
                        <h4 className="font-medium mb-4 text-center">Preferred Contact Method</h4>
                        <Pie
                            data={{
                                labels: ['Email', 'Telegram'],
                                datasets: [{
                                    data: [contactPrefs.email, contactPrefs.telegram],
                                    backgroundColor: ['#3b82f6', '#22c55e'],
                                    borderRadius: 5,
                                }]
                            }}
                            options={{
                                plugins: { legend: { position: 'bottom' } }
                            }}
                        />
                    </div>
                </div>
                {/* 📈 Time Data */}
                <MessageSentLineChart />
            </CardContent>
        </Card>
    )
}