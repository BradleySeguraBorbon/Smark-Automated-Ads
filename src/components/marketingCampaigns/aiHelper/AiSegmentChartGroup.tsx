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
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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

    const segmentedColors = [
        '#38bdf8', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#10b981', '#eab308'
    ];

    const individualData = {
        labels: [
            ...segmentGroups.map(s => s.reason),
            ...(unsegmented > 0 ? ['Unsegmented Clients'] : [])
        ],
        datasets: [{
            data: [
                ...segmentGroups.map(s => s.clientIds.length),
                ...(unsegmented > 0 ? [unsegmented] : [])
            ],
            backgroundColor: [
                ...segmentedColors.slice(0, segmentGroups.length),
                ...(unsegmented > 0 ? ['rgba(156,163,175,0.3)'] : []) // Light gray transparent
            ],
            borderColor: [
                ...Array(segmentGroups.length).fill('#ffffff'),
                ...(unsegmented > 0 ? ['rgba(107,114,128,0.5)'] : []) // border for gray
            ],
            borderWidth: 1
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
                    <div className="flex justify-center w-full">
                        <div className="max-w-[320px] w-full">
                            <Pie data={individualData} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Segment Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {segmentGroups.map((group, index) => {
                            const count = group.clientIds.length;
                            const percentage = ((count / totalClients) * 100).toFixed(1);

                            return (
                                <div key={index} className="flex flex-col items-center space-y-2">
                                    <div className="w-24 h-24">
                                        <CircularProgressbar
                                            value={parseFloat(percentage)}
                                            text={`${percentage}%`}
                                            styles={buildStyles({
                                                textSize: '16px',
                                                pathColor: '#4f46e5',
                                                textColor: '#e4e5e6',
                                                trailColor: '#e5e7eb',
                                            })}
                                        />
                                    </div>
                                    <div className="text-sm font-medium text-center">
                                        {group.reason}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{count} clients</div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>


            {/* Puedes agregar más gráficas aquí */}
        </div>
    );
}
