'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MCPStrategyResponse } from '@/types/MCP';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
                    Select Segments for a New Campaign
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {strategy.segmentGroups.map((group, index) => {
                        const isSelected = selectedIndexes.includes(index);
                        const count = group.clientIds.length;

                        return (
                            <button
                                key={index}
                                onClick={() => toggleSegment(index)}
                                className={`border rounded-xl p-4 text-left shadow-sm transition hover:shadow-md focus:outline-none
                                        ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-white'}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm font-semibold text-white">
                                        {group.criterion} = {group.value}
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                        {isSelected && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-200">{count} clients</p>
                            </button>
                        );
                    })}
                </div>

                <div className="pt-4 text-center">
                    <Button
                        onClick={handleCreateCampaign}
                        disabled={selectedIndexes.length === 0}
                        className='bg-blue-600 hover:bg-blue-700 text-white font-semibold'
                    >
                        Create Campaign with Selected Audiences
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
