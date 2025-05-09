'use client';

import { CampaignFormTabs } from '@/components/marketingCampaigns/form/CampaignFormTabs';
import { CampaignSummary } from '@/components/marketingCampaigns/form/CampaignSummary';
import { usePathname, useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useTagStore, useUserListStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { MarketingCampaignFormData } from '@/types/MarketingCampaign';
import { useForm, FormProvider } from 'react-hook-form';
import { transformMarketingCampaignForSave } from '@/lib/transformers';
import CustomAlertDialog from '@/components/CustomAlertDialog';
import { TagRef } from '@/types/Tag';
import { UserRef } from '@/types/User';
import { ObjectId } from 'mongodb';
import { IClient, ClientRef } from '@/types/Client';

export default function EditCampaignPage() {
    const { id } = useParams();
    const form = useForm<MarketingCampaignFormData>({
        defaultValues: {
            name: '',
            description: '',
            status: 'inactive',
            startDate: undefined,
            endDate: undefined,
            tags: [],
            users: [],
            performance: {
                totalEmailsSent: 0,
                totalEmailsOpened: 0,
                telegramMessagesSent: 0,
                telegramMessagesOpened: 0
            }
        }
    });
    const { setValue } = form;

    const [successOpen, setSuccessOpen] = useState(false);

    const allTags = useTagStore((state) => state.tags);
    const setTags = useTagStore((state) => state.setTags);
    const tagsHydrated = useTagStore((state) => state.hasHydrated);

    const allUsers = useUserListStore((state) => state.users);
    const setUsers = useUserListStore((state) => state.setUsers);
    const usersHydrated = useUserListStore((state) => state.hasHydrated);

    const currentPath = usePathname();
    const routes = [
        { href: '/', label: 'Dashboard' },
        { href: '/marketingCampaigns', label: 'Campaigns' },
        { href: '/adMessages', label: 'Ad-Messages' },
        { href: '/clients', label: 'Clients' },
        { href: '/tags', label: 'Tags' },
    ];

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`/api/marketingCampaigns/${id}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    const campaign = {
                        ...data.result,
                        startDate: data.result.startDate ? new Date(data.result.startDate) : new Date(),
                        endDate: data.result.endDate ? new Date(data.result.endDate) : new Date(),
                    };
                    Object.entries(campaign).forEach(([key, value]) => {
                        setValue(key as keyof MarketingCampaignFormData, value as string | Date | TagRef[] | UserRef[] | ObjectId | undefined);
                    });
                } else {
                    console.error('Failed to fetch campaign:', data);
                }
            } catch (error) {
                console.error('Error fetching campaign:', error);
            }
        };

        fetchCampaign();
    }, [id, setValue]);

    useEffect(() => {
        if (!tagsHydrated) return;
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags', {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                    },
                });
                const data = await response.json();
                setTags(data.results);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };
        if (!allTags || allTags.length === 0) fetchTags();
    }, [tagsHydrated, allTags, setTags]);

    useEffect(() => {
        if (!usersHydrated) return;
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users', {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                    },
                });
                const data = await response.json();
                setUsers(data.results);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        if (!allUsers || allUsers.length === 0) fetchUsers();
    }, [usersHydrated, allUsers, setUsers]);

    const handleUpdate = async (data: MarketingCampaignFormData) => {
        const payload = transformMarketingCampaignForSave(data);
        try {
            const tagQuery = payload.tags.map(id => `tagIds[]=${id}`).join('&');
            const clientRes = await fetch(`/api/clients?${tagQuery}&limit=10000`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                },
            });
            const clientData = await clientRes.json();
            const allClientIds = clientData.results.map((c: IClient) => c._id);

            const response = await fetch(`/api/marketingCampaigns/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) {
                console.error('Update failed:', result);
                return;
            }

            console.log('Campaign updated:', result.result);

            await fetch(`/api/campaignAudiences/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                },
                body: JSON.stringify({
                    campaign: id,
                    audience: allClientIds,
                    status: 'approved',
                }),
            });

            setSuccessOpen(true);
        } catch (error) {
            console.error('Error updating campaign:', error);
        }
    };

    if (!tagsHydrated || !usersHydrated) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header>
                <Navbar currentPath={currentPath} routes={routes} />
            </header>
            <main>
                <div className="container mx-auto py-8 px-50">
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
                                    onSubmit={handleUpdate}
                                    allTags={allTags}
                                    allUsers={allUsers}
                                    form={form}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <CampaignSummary onSubmit={handleUpdate} mode="edit" />
                            </div>
                        </div>
                    </FormProvider>
                    <CustomAlertDialog
                        open={successOpen}
                        type="success"
                        title="Campaign Updated"
                        description="The marketing campaign was successfully updated."
                        confirmLabel="Back to Campaigns"
                        onConfirm={() => {
                            setSuccessOpen(false);
                            window.location.href = "/marketingCampaigns";
                        }}
                        onOpenChange={setSuccessOpen}
                    />
                </div>
            </main>
        </div>
    );
}
