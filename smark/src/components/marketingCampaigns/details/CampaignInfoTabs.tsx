'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CampaignDetailsCard from './CampaignDetailsCard'
import CampaignAudienceCard from './CampaignAudienceCard'
import CampaignPerformanceCard from './CampaignPerformanceCard'
import { IMarketingCampaign } from '@/types/MarketingCampaign'

interface CampaignInfoTabsProps {
    campaign: IMarketingCampaign;
}

export default function CampaignInfoTabs({ campaign }: CampaignInfoTabsProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'audience' | 'performance'>('details');

    return (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'details' | 'audience' | 'performance')} className="w-full">
            <TabsList className='grid grid-cols-3 w-full mb-6 rounded-lg border'>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
                <CampaignDetailsCard campaign={campaign} />
            </TabsContent>

            <TabsContent value="audience" className="space-y-6">
                <CampaignAudienceCard campaignId={String(campaign._id)} />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
                <CampaignPerformanceCard performance={campaign.performance} />
            </TabsContent>
        </Tabs>
    )
}
