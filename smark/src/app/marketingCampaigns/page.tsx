'use client'

import { useEffect, useState } from 'react'
import { useMarketingCampaignStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { CampaignCard } from '@/components/CampaignCard'
import { PlusCircle, Filter } from 'lucide-react'
import Link from 'next/link'
import { IMarketingCampaign } from '@/types/MarketingCampaign'
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar'
import PaginationControls from '@/components/PaginationControls'

export default function MarketingCampaignsPage() {
    const currentPath = usePathname();
    const routes = [
        { href: "/", label: "Dashboard" },
        { href: "/marketingCampaigns", label: "Campaigns" },
        { href: "/adMessages", label: "Ad-Messages" },
        { href: "/clients", label: "Clients" },
        { href: "/tags", label: "Tags" }
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const campaigns = useMarketingCampaignStore((state) => state.campaigns);
    const setCampaigns = useMarketingCampaignStore((state) => state.setCampaigns);
    const clearCampaigns = useMarketingCampaignStore((state) => state.clearCampaigns);
    const hasHydrated = useMarketingCampaignStore((state) => state.hasHydrated);

    console.log('Campaigns:', campaigns);
    console.log('Has hydrated:', hasHydrated);


    useEffect(() => {
        if (!hasHydrated) return;

        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/marketingCampaigns?page=${currentPage}&limit=10`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                    }
                })
                const data = await response.json();
                setCampaigns(data.results as IMarketingCampaign[]);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error('Failed to fetch campaigns:', error);
                clearCampaigns();
            } finally {
                setLoading(false);
            }
        }

        fetchCampaigns();
    }, [currentPage, hasHydrated])

    useEffect(() => {
        if (campaigns !== undefined) {
            useMarketingCampaignStore.setState({ hasHydrated: true });
        }
    }, [campaigns]);

    const handleDelete = async (campaignId: string) => {
        try {
            const response = await fetch(`/api/marketingCampaigns/${campaignId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete campaign");
            }

            const updatedCampaigns = campaigns.filter((c: IMarketingCampaign) => c._id !== campaignId);
            setCampaigns(updatedCampaigns);
        } catch (error) {
            console.error("Error deleting campaign:", error);
        }
    };

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
                                <Link href="/marketingCampaigns/new">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    New Campaign
                                </Link>
                            </Button>
                        </div>
                    </div>
                    {loading ? (
                        <p className="text-center">Loading campaigns...</p>
                    ) : (
                        <>
                            <div className="grid gap-6">
                                {campaigns?.map((campaign) => (
                                    <CampaignCard
                                        key={String(campaign._id)}
                                        campaign={campaign}
                                        onDelete={() => handleDelete(String(campaign._id))}
                                    />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}