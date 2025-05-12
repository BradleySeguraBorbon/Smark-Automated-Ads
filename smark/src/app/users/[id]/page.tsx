'use client';

import {useAuthStore} from '@/lib/store';
import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import BreadcrumbHeader from "@/components/BreadcrumbHeader";

interface MarketingCampaign {
    _id: string;
    name?: string;
}

interface UserInfo {
    _id: string;
    username: string;
    role: string;
    marketingCampaigns?: MarketingCampaign[];
    createdAt?: string;
    updatedAt?: string;
}

export default function ProfilePage() {
    const token = useAuthStore((state) => state.token);
    const _hasHydrated = useAuthStore((state)=> state._hasHydrated);
    const params = useParams();
    const id = params.id;
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        if(!_hasHydrated) return;
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchUser = async (token: string) => {
            setLoading(true)
            try {
                const response = await fetch(`/api/users/${id}/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ` + token
                    },
                })

                const result = await response.json()

                if (!response.ok) {
                    const errorMessage = result.message || result.error || "Unknown error occurred"
                    setApiError(errorMessage)
                    return
                }

                setUserInfo(result.result)
            } catch (error) {
                console.error("Fetch error:", error)
                setApiError("Unexpected error occurred.")
            } finally {
                setLoading(false)
            }
        }

        fetchUser(token as string);
    }, [_hasHydrated,token, router]);

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner/>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto py-10 max-w-lg">
                <BreadcrumbHeader backHref="/users" title="User Information"/>
                <Card>
                    <CardContent className="space-y-4">
                        {apiError && (
                            <div className="text-red-500 bg-red-100 p-3 rounded">{apiError}</div>
                        )}
                        <p>
                            <span className="font-semibold">Username:</span> {userInfo?.username}
                        </p>
                        <p>
                            <span className="font-semibold">Role:</span> {userInfo?.role}
                        </p>
                        {userInfo?.createdAt && (
                            <p>
                                <span className="font-semibold">Created At:</span>{' '}
                                {new Date(userInfo.createdAt).toLocaleString()}
                            </p>
                        )}
                        {userInfo?.updatedAt && (
                            <p>
                                <span className="font-semibold">Updated At:</span>{' '}
                                {new Date(userInfo.updatedAt).toLocaleString()}
                            </p>
                        )}

                        {userInfo?.marketingCampaigns && userInfo.marketingCampaigns.length > 0 && (
                            <div>
                                <p className="font-semibold">Marketing Campaigns:</p>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    {userInfo.marketingCampaigns.map((campaign) => (
                                        <li key={campaign._id}>
                                            {campaign.name ? (
                                                <>
                                                    {campaign.name} (<span
                                                    className="text-gray-500">{campaign._id}</span>)
                                                </>
                                            ) : (
                                                campaign._id
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/*<div className="pt-4">
                            <Button variant="outline" onClick={() => router.back()}>
                                Back
                            </Button>
                        </div>*/}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}