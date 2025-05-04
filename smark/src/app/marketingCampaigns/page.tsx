'use client'

import { useEffect } from 'react'
import { useMarketingCampaignStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { CampaignCard } from '@/components/CampaignCard'
import { PlusCircle, Mail, MessageSquare, Filter } from 'lucide-react'
import Link from 'next/link'
import { IMarketingCampaign } from '@/types/MarketingCampaign'
import { useStore } from 'zustand';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar'

export default function MarketingCampaignsPage() {
    const currentPath = usePathname();
    const routes = [
        { href: "/", label: "Dashboard" },
        { href: "/marketingCampaigns", label: "Campaigns" },
        { href: "/adMessages", label: "Ad-Messages" },
        { href: "/clients", label: "Clients" },
        { href: "/analytics", label: "Analytics" },
    ];

    const campaigns = useMarketingCampaignStore((state) => state.campaigns);
    const setCampaigns = useMarketingCampaignStore((state) => state.setCampaigns);
    const hasHydrated = useMarketingCampaignStore((state) => state.hasHydrated);

    console.log('Campaigns:', campaigns);
    console.log('Has hydrated:', hasHydrated);


    useEffect(() => {
        if (!hasHydrated) return;

        const fetchCampaigns = async () => {
            try {
                const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2N2ZkOTc3ODEzMTBjMTE5MTRhNzExMmEiLCJ1c2VybmFtZSI6ImJyYWRsZXkiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDYzMTYzNjAsImV4cCI6MTc0NjMxOTk2MH0.CkT_CcvH9r5rndvY20OGZN_JTwrxm2P5MrpwekXwXAA";
                const response = await fetch('/api/marketingCampaigns', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                })
                const data = await response.json()
                setCampaigns(data.results as IMarketingCampaign[])
            } catch (error) {
                console.error('Failed to fetch campaigns:', error)
            }
        }

        if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
            fetchCampaigns();
        }
    }, [hasHydrated, setCampaigns, campaigns])

    useEffect(() => {
        if (campaigns !== undefined) {
            console.log('✅ Detected campaigns loaded, setting hasHydrated');
            useMarketingCampaignStore.setState({ hasHydrated: true });
        }
    }, [campaigns]);

    if (!hasHydrated) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header>
                <Navbar currentPath={currentPath} routes={routes} />
            </header>
            <main>
                <div className="container mx-auto py-8 px-50">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Campaigns</h1>
                            <p className="text-muted-foreground">Manage your marketing campaigns</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                            <Button asChild>
                                <Link href="/campaigns/new">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    New Campaign
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-6">
                        {campaigns?.map((campaign) => (
                            <CampaignCard campaign={campaign} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}