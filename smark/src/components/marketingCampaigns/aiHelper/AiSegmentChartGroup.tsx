'use client';

import { MCPStrategyResponse } from '@/types/MCP';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const getFriendlyValue = (criterion: string, value: string) => {
    if (criterion === 'birthDate' && value.startsWith('Month-')) {
        const monthIndex = parseInt(value.split('-')[1]) - 1;
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[monthIndex] || value;
    }
    return value;
};

export default function AiSegmentChartGroup({ strategy }: { strategy: MCPStrategyResponse }) {
    const { totalClients, segmentGroups } = strategy;

    if (!segmentGroups || segmentGroups.length === 0) return null;

    const allSegmentedClientIds = new Set(segmentGroups.flatMap(s => s.clientIds));
    const unsegmented = totalClients - allSegmentedClientIds.size;

    const individualData = {
        labels: [
            ...segmentGroups.map(s => `${s.criterion} = ${getFriendlyValue(s.criterion, s.value)}`),
            ...(unsegmented > 0 ? ['Unsegmented Clients'] : [])
        ],
        datasets: [{
            data: [
                ...segmentGroups.map(s => s.clientIds.length),
                ...(unsegmented > 0 ? [unsegmented] : [])
            ],
            backgroundColor: [
                '#38bdf8', '#22c55e', '#f97316', '#a855f7', '#ef4444',
                ...(unsegmented > 0 ? ['#9ca3af'] : [])
            ]
        }]
    };


    const overlapData = {
        labels: segmentGroups.map(s => `${s.criterion} = ${getFriendlyValue(s.criterion, s.value)}`),
        datasets: [{
            label: 'Clients per Group',
            data: segmentGroups.map(s => s.clientIds.length),
            backgroundColor: '#6366f1'
        }]
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Audience Coverage by Segment</CardTitle>
                </CardHeader>
                <CardContent>
                    <Pie data={individualData} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Raw Client Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <Bar data={overlapData} />
                </CardContent>
            </Card>

            {/* Puedes agregar más gráficas aquí */}
        </div>
    );
}
