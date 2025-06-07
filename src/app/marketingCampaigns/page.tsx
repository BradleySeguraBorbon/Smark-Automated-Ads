'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store';
import { decodeToken } from '@/lib/utils/decodeToken';
import { useRouter } from 'next/navigation';
import { useMarketingCampaignStore } from '@/lib/store'
import CampaignList from '@/components/marketingCampaigns/CampaignList'
import CampaignsListHeader from '@/components/marketingCampaigns/CampaignsListHeader'
import { IMarketingCampaign } from '@/types/MarketingCampaign'
import PaginationControls from '@/components/PaginationControls'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function MarketingCampaignsPage() {
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
            console.log("Campaigns received:", data.results);
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

    const isReady = _hasHydrated && hasFetched && campaignsHydrated && userInfo;
    if (!isReady || loading) return <LoadingSpinner />

    return (
        <div>
            <main>
                <div className="container mx-auto py-8 lg:px-44 md:px-20 px-10 transition-all duration-300 ease-in-out">
                    {userInfo &&
                        <CampaignsListHeader userRole={userInfo.role} />
                    }
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <CampaignList
                                campaigns={campaigns}
                                onDelete={handleDelete}
                                userRole={userInfo?.role}
                            />
                            {totalPages > 1 && (
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChangeAction={(page) => setCurrentPage(page)}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}