'use client'

import React from 'react';
import { MCPStrategyResponse } from '@/types/MCP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AiGlobalStatsProps {
    strategy: MCPStrategyResponse;
}

export default function AiGlobalStats({ strategy }: AiGlobalStatsProps) {
    const { totalClients, selectedClients, coverage, segmentGroups } = strategy;

    return (
        <Card className="w-full shadow-md border">
            <CardHeader>
                <CardTitle>Segmentation Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                    <p className="text-3xl font-bold">{(coverage * 100).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Coverage</p>
                </div>
                <div>
                    <p className="text-3xl font-bold">{totalClients}</p>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                </div>
                <div>
                    <p className="text-3xl font-bold">{selectedClients?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Segmented Clients</p>
                </div>
                <div>
                    <p className="text-3xl font-bold">{segmentGroups?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Segments Created</p>
                </div>
            </CardContent>
        </Card>
    );
}
