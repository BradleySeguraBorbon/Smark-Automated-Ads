'use client';

import { useEffect, useState } from 'react'
import { notFound } from "next/navigation"
import CampaignHeader from "@/components/marketingCampaigns/details/CampaignHeader"
import CampaignInfoTabs from "@/components/marketingCampaigns/details/CampaignInfoTabs"
import { IMarketingCampaign } from "@/types/MarketingCampaign"
import { Button } from "@/components/ui/button"
import { Pencil, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useAuthStore } from "@/lib/store"
import { decodeToken } from "@/lib/utils/decodeToken"
import { ClientRef } from "@/types/Client"



export default function MarketingCampaignDetailPage({ params }: { params: { id: string } }) {
    const { id } = useParams();
    const router = useRouter();

    const [campaign, setCampaign] = useState<IMarketingCampaign | null>(null);
    const [loading, setLoading] = useState(true);

    const token = useAuthStore((state) => state.token);
    const hydrated = useAuthStore((state) => state._hasHydrated);

    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);
    const [audience, setAudience] = useState<ClientRef[]>([]);
    const [audiencePage, setAudiencePage] = useState(1);
    const [audienceTotalPages, setAudienceTotalPages] = useState(1);

    const fetchCampaign = async () => {
        try {
            const res = await fetch(`/api/marketingCampaigns/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (!res.ok) throw new Error('Failed to fetch campaign');
            const data = await res.json();
            setCampaign(data.result);
        } catch (err) {
            console.error(err);
            setCampaign(null);
        } finally {
            setLoading(false);
        }
    }

    const fetchAudience = async () => {
        try {
            const res = await fetch(`/api/campaignAudiences?campaignId=${id}&page=${audiencePage}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.result?.audience) {
                setAudience(data.result.audience);
                setAudienceTotalPages(data.totalPages || 1);
            }
        } catch (err) {
            console.error('Failed to fetch audience:', err);
            setAudience([]);
            setAudienceTotalPages(1);
        }
    };

    useEffect(() => {
        if (!hydrated) return;

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
            fetchCampaign();
            fetchAudience();
        };

        init();
    }, [id, token, hydrated, audiencePage])

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner />
            </div>
        )
    }
    if (!campaign) {
        return notFound()
    }

    return (
        <>
            <main>
                <div className="container mx-auto py-8 px-50">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <Button variant="ghost" size="sm" asChild className="mr-2">
                                <Link href="/marketingCampaigns">
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold">{campaign.name}</h1>
                        </div>
                        {userInfo?.role !== 'employee' &&
                            <Button asChild className="bg-blue-600 hover:bg-blue-800 text-white" size="sm">
                                <Link href={`/marketingCampaigns/${campaign._id}/edit`}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Campaign
                                </Link>
                            </Button>}
                    </div>
                    <CampaignHeader campaign={campaign} />
                    <CampaignInfoTabs
                        campaign={campaign}
                        audience={audience}
                        audienceAudienceTotalPages={audienceTotalPages}
                        audienceCurrentPage={audiencePage}
                        onAudiencePageChangeAction={setAudiencePage}
                    />
                </div>
            </main>
        </>
    )
}
