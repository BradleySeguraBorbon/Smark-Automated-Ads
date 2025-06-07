'use client';

import { useState } from 'react';
import AiPromptForm from '@/components/marketingCampaigns/aiHelper/AiPromptForm';
import AiSegmentChartGroup from '@/components/marketingCampaigns/aiHelper/AiSegmentChartGroup';
import AiGlobalStats from '@/components/marketingCampaigns/aiHelper/AiGlobalStats';
import AiSegmentActions from '@/components/marketingCampaigns/aiHelper/AiSegmentActions';
import { MCPStrategyResponse } from '@/types/MCP';

export default function AICampaignsPage() {
    const [strategy, setStrategy] = useState<MCPStrategyResponse | null>(null);

    return (
        <>
            <main className="container mx-auto px-50 py-8 space-y-10">
                <AiPromptForm onStrategyLoaded={setStrategy} />
                {strategy && (
                    <>
                        <AiGlobalStats strategy={strategy} />
                        <AiSegmentChartGroup strategy={strategy} />
                        <AiSegmentActions strategy={strategy} />
                    </>
                )}
            </main>
        </>
    );
}
