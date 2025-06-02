'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { MCPStrategyResponse } from '@/types/MCP';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AiSegmentActionsProps {
    strategy: MCPStrategyResponse;
}

export default function AiSegmentActions({ strategy }: AiSegmentActionsProps) {
    const router = useRouter();

    return (
        <Card className="mt-6 border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Create Campaigns from Segments
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategy.segmentGroups.map((group, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        className="flex justify-between items-center w-full"
                        onClick={() =>
                            router.push(
                                `/marketingCampaigns/new?ai=true&criterion=${group.criterion}&value=${group.value}`
                            )
                        }
                    >
                        <span>Create Campaign: {group.criterion} = {group.value}</span>
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}
