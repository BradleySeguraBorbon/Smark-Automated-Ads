'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MCPStrategyResponse } from '@/types/MCP';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox  } from '@/components/ui/checkbox';
import { Sparkles } from 'lucide-react';

interface AiSegmentActionsProps {
    strategy: MCPStrategyResponse;
}

export default function AiSegmentActions({ strategy }: AiSegmentActionsProps) {
    const router = useRouter();
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

    const toggleSegment = (index: number) => {
        setSelectedIndexes((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    const handleCreateCampaign = () => {
        const selectedClients = new Set<string>();
        selectedIndexes.forEach((index) => {
            strategy.segmentGroups[index]?.clientIds.forEach((id) => selectedClients.add(id));
        });

        const allClientIds = Array.from(selectedClients);
        const queryParam = encodeURIComponent(JSON.stringify(allClientIds));
        router.push(`/marketingCampaigns/new?ai=true&audience=${queryParam}`);
    };

    return (
        <Card className="mt-6 border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Select Segments for a new Campaign
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {strategy.segmentGroups.map((group, index) => (
                        <label key={index} className="flex items-center gap-2">
                            <Checkbox
                                checked={selectedIndexes.includes(index)}
                                onCheckedChange={() => toggleSegment(index)}
                            />
                            <span>{group.criterion} = {group.value}</span>
                        </label>
                    ))}
                </div>

                <div className="pt-4 text-center">
                    <Button
                        onClick={handleCreateCampaign}
                        disabled={selectedIndexes.length === 0}
                    >
                        Create Campaign with Selected Audiences
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
