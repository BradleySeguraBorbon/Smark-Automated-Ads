'use client'

import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js'
import { useEffect, useState } from 'react'
import { subDays, format } from 'date-fns'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

interface MessageSentLineChartProps {
    campaignId: string;
}

interface MessageData {
    date: string
    count: number
}

export default function MessageSentLineChart({ campaignId }: MessageSentLineChartProps) {
    const [data, setData] = useState<MessageData[]>([])

    useEffect(() => {
        const fetchMessages = async () => {
            const res = await fetch(`/api/adMessages/sentDates?campaignId=${campaignId}`)
            const raw = await res.json()
            const grouped = raw.reduce((acc: Record<string, number>, msg: { sendDate: string }) => {
                const date = format(new Date(msg.sendDate), 'yyyy-MM-dd')
                acc[date] = (acc[date] || 0) + 1
                return acc
            }, {})

            const sorted = Object.entries(grouped)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([date, count]) => ({ date, count }))

            setData(sorted)
        }

        fetchMessages()
    }, [])

    return (
        <div className="w-full border rounded-md p-10">
            <h4 className="font-medium mb-4">Messages Sent Over Time</h4>
            <Line
                data={{
                    labels: data.map(d => d.date),
                    datasets: [{
                        label: 'Messages Sent',
                        data: data.map(d => d.count),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                        tension: 0.3,
                    }]
                }}
                options={{
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { title: { display: true, text: 'Date' } },
                        y: { title: { display: true, text: 'Count' }, beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }}
            />
        </div>
    )
}
