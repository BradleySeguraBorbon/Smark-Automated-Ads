'use client';

import { CampaignFormTabs } from '@/components/marketingCampaigns/form/CampaignFormTabs';
import { CampaignSummary } from '@/components/marketingCampaigns/form/CampaignSummary';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useTagStore, useUserListStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { MarketingCampaignFormData } from '@/types/MarketingCampaign';
import { useForm, FormProvider } from 'react-hook-form';
import { transformMarketingCampaignForSave } from '@/lib/transformers';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import { TagRef } from '@/types/Tag';
import { UserRef } from '@/types/User';
import { ObjectId } from 'mongodb';
import { IClient } from '@/types/Client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { decodeToken } from '@/lib/utils/decodeToken';

export default function EditCampaignPage() {
    const { id } = useParams();
    const router = useRouter();
    const currentPath = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    const token = useAuthStore((state) => state.token);
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);

    const allTags = useTagStore((state) => state.tags);
    const setTags = useTagStore((state) => state.setTags);
    const tagsHydrated = useTagStore((state) => state.hasHydrated);

    const allUsers = useUserListStore((state) => state.users);
    const setUsers = useUserListStore((state) => state.setUsers);
    const usersHydrated = useUserListStore((state) => state.hasHydrated);

    const [isAiGeneratedFlag, setIsAiGeneratedFlag] = useState(false);


    const [successOpen, setSuccessOpen] = useState(false);

    const form = useForm<MarketingCampaignFormData>({
        defaultValues: {
            name: '',
            description: '',
            status: 'inactive',
            startDate: undefined,
            endDate: undefined,
            tags: [],
            users: [],
            isAiGenerated: false,
            performance: {
                totalEmailsSent: 0,
                totalEmailsOpened: 0,
                telegramMessagesSent: 0,
                telegramMessagesOpened: 0
            }
        }
    });
    const { setValue } = form;

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags?page=1&limit=1000', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setTags(data.results);
            useTagStore.setState({ hasHydrated: true });
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setUsers(data.results);
            useUserListStore.setState({ hasHydrated: true });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchCampaign = async () => {
        try {
            const response = await fetch(`/api/marketingCampaigns/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                const campaign = {
                    ...data.result,
                    startDate: data.result.startDate ? new Date(data.result.startDate) : new Date(),
                    endDate: data.result.endDate ? new Date(data.result.endDate) : new Date(),
                };
                setIsAiGeneratedFlag(campaign.isAiGenerated);
                Object.entries(campaign).forEach(([key, value]) => {
                    setValue(key as keyof MarketingCampaignFormData, value as any);
                });
            } else {
                console.error('Failed to fetch campaign:', data);
            }
        } catch (error) {
            console.error('Error fetching campaign:', error);
        }
    };

    useEffect(() => {
        if (!_hasHydrated) return;

        const init = async () => {
            if (!token) {
                return router.push('/auth/login');
            }
            const user = await decodeToken(token);
            if (!user) {
                return router.push('/auth/login');
            }
            setUserInfo(user);

            await Promise.all([
                fetchTags(),
                fetchUsers(),
                fetchCampaign()
            ]);

            setIsLoading(false);
        };

        init();
    }, [id, _hasHydrated, token]);

    const handleUpdate = async (data: MarketingCampaignFormData) => {
        const payload = transformMarketingCampaignForSave(data);
        try {
            let allClientIds: string[] = [];

            if (!data.isAiGenerated) {
                const tagQuery = payload.tags.map(id => `tagIds[]=${id}`).join('&');
                const clientRes = await fetch(`/api/clients?${tagQuery}&limit=10000`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const clientData = await clientRes.json();
                allClientIds = clientData.results.map((c: IClient) => c._id);
            }

            const response = await fetch(`/api/marketingCampaigns/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) {
                console.error('Update failed:', result);
                return;
            }

            console.log('Campaign updated:', result.result);

            if (!data.isAiGenerated) {
                await fetch(`/api/campaignAudiences/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        campaign: id,
                        audience: allClientIds,
                        status: 'approved',
                    }),
                });
            }

            setSuccessOpen(true);
        } catch (error) {
            console.error('Error updating campaign:', error);
        }
    };

    if (!tagsHydrated || !usersHydrated || isLoading) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div>
            <main>
                <div className="container mx-auto py-8 lg:px-44 md:px-20 px-4 transition-all duration-300 ease-in-out">
                    <div className="flex items-center mb-6">
                        <Button variant="ghost" size="sm" asChild className="mr-2">
                            <Link href="/marketingCampaigns">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold ml-3">Edit Campaign</h1>
                    </div>
                    <FormProvider {...form}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <CampaignFormTabs
                                    mode="edit"
                                    onSubmitAction={handleUpdate}
                                    allTags={allTags}
                                    allUsers={allUsers}
                                    form={form}
                                    campaignId={id as string}
                                    isAiGenerated={isAiGeneratedFlag}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <CampaignSummary onSubmitAction={handleUpdate} mode="edit" />
                            </div>
                        </div>
                    </FormProvider>
                    <CustomAlertDialog
                        open={successOpen}
                        type="success"
                        title="Campaign Updated"
                        description="The marketing campaign was successfully updated."
                        confirmLabel="Back to Campaigns"
                        onConfirmAction={() => {
                            setSuccessOpen(false);
                            window.location.href = "/marketingCampaigns";
                        }}
                        onOpenChangeAction={setSuccessOpen}
                    />
                </div>
            </main>
        </div>
    );
}
