'use client';

import { useEffect, useState } from 'react'
import { notFound } from "next/navigation"
import CampaignHeader from "@/components/marketingCampaigns/details/CampaignHeader"
import CampaignInfoTabs from "@/components/marketingCampaigns/details/CampaignInfoTabs"
import { IMarketingCampaign } from "@/types/MarketingCampaign"
import { Button } from "@/components/ui/button"
import { Pencil, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Navbar } from "@/components/Navbar"

export default function MarketingCampaignDetailPage({ params }: { params: { id: string } }) {
    const { id } = useParams();
    const currentPath = usePathname();

    const [campaign, setCampaign] = useState<IMarketingCampaign | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const res = await fetch(`/api/marketingCampaigns/${id}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                    },
                })
                if (!res.ok) throw new Error('Failed to fetch campaign')
                const data = await res.json()
                setCampaign(data.result)
            } catch (err) {
                console.error(err)
                setCampaign(null)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchCampaign()
    }, [id])

    if (loading) return <div className="p-4">Loading campaign...</div>
    if (!campaign) return notFound()

    const routes = [
        { href: "/", label: "Dashboard" },
        { href: "/marketingCampaigns", label: "Campaigns" },
        { href: "/adMessages", label: "Ad-Messages" },
        { href: "/clients", label: "Clients" },
        { href: "/tags", label: "Tags" }
    ];

    return (
        <>
            <header>
                <Navbar currentPath={currentPath} routes={routes} />
            </header >
            <main>
                <div className="container mx-auto py-8 px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <Button variant="ghost" size="sm" asChild className="mr-2">
                                <Link href="/campaigns">
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold">{campaign.name}</h1>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/marketingCampaigns/${campaign._id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Campaign
                            </Link>
                        </Button>
                    </div>
                    <CampaignHeader campaign={campaign} />
                    <CampaignInfoTabs campaign={campaign} />
                </div>
            </main>
        </>
    )
}
