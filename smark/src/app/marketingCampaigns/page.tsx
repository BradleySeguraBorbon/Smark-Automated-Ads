'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store';
import { decodeToken } from '@/lib/utils/decodeToken';
import { useRouter } from 'next/navigation';
import { useMarketingCampaignStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { CampaignCard } from '@/components/marketingCampaigns/CampaignCard'
import { PlusCircle, Filter } from 'lucide-react'
import Link from 'next/link'
import { IMarketingCampaign } from '@/types/MarketingCampaign'
import { usePathname } from 'next/navigation';
import PaginationControls from '@/components/PaginationControls'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function MarketingCampaignsPage() {
    const currentPath = usePathname();

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const token = useAuthStore((state) => state.token);
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);
    const router = useRouter();

    const campaigns = useMarketingCampaignStore((state) => state.campaigns);
    const setCampaigns = useMarketingCampaignStore((state) => state.setCampaigns);
    const clearCampaigns = useMarketingCampaignStore((state) => state.clearCampaigns);
    const campaignsHydrated = useMarketingCampaignStore((state) => state.hasHydrated);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/marketingCampaigns?page=${currentPage}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
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
            useMarketingCampaignStore.setState({ hasHydrated: true });
        }
    }

    useEffect(() => {
        if (!_hasHydrated) return;

        const init = async () => {
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const user = await decodeToken(token);
            if (!user) {
                router.push('/auth/login');
                return;
            }

            setUserInfo(user);
            await fetchCampaigns();
            setHasFetched(true);
        };

        init();
    }, [_hasHydrated, token, currentPage]);

    const handleDelete = async (campaignId: string) => {
        try {
            const response = await fetch(`/api/marketingCampaigns/${campaignId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
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

    if (loading || !userInfo || !campaignsHydrated || !hasFetched || !_hasHydrated) {
        return <LoadingSpinner />
    }

    return (
        <div>
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
                            <Button className="bg-purple-600 hover:bg-purple-800 text-white" asChild>
                                {userInfo && userInfo?.role !== 'employee' &&
                                    <Link href="/marketingCampaigns/new">
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        New Campaign
                                    </Link>
                                }
                            </Button>
                        </div>
                    </div>
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <div className="grid gap-6">
                                {campaigns?.map((campaign) => (
                                    <CampaignCard
                                        key={String(campaign._id)}
                                        campaign={campaign}
                                        onDelete={() => handleDelete(String(campaign._id))}
                                        userRole={userInfo?.role as string}
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