'use client';

import { CampaignFormTabs } from '@/components/CampaignFormTabs';
import { CampaignSummary } from '@/components/CampaignSummary';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useTagStore } from '@/lib/store';
import { useUserListStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { MarketingCampaignFormData } from '@/types/MarketingCampaign';
import { transformMarketingCampaignForSave } from '@/lib/transformers';
import { useForm, FormProvider } from 'react-hook-form';
import CustomAlertDialog from '@/components/CustomAlertDialog'
import { IClient, ClientRef } from '@/types/Client';

export default function NewCampaignPage() {
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


    console.log('CreateCampaignPage mounted!');
    const allTags = useTagStore((state) => state.tags);
    const setTags = useTagStore((state) => state.setTags);
    const tagsHydrated = useTagStore((state) => state.hasHydrated);

    const allUsers = useUserListStore((state) => state.users);
    const setUsers = useUserListStore((state) => state.setUsers);
    const usersHydrated = useUserListStore((state) => state.hasHydrated);
    const [audience, setAudience] = useState<ClientRef[]>([]);

    const [successOpen, setSuccessOpen] = useState(false);

    const currentPath = usePathname();
    const routes = [
        { href: "/", label: "Dashboard" },
        { href: "/marketingCampaigns", label: "Campaigns" },
        { href: "/adMessages", label: "Ad-Messages" },
        { href: "/clients", label: "Clients" },
        { href: "/tags", label: "Tags" }
    ];

    useEffect(() => {
        if (!tagsHydrated) return;
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                    }
                });
                const data = await response.json();
                setTags(data.results);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };

        if (!allTags || !Array.isArray(allTags) || allTags.length === 0) {
            fetchTags();
        }
    }, [tagsHydrated, allTags, setTags]);

    useEffect(() => {
        if (allTags && allTags.length > 0) {
            useTagStore.setState({ hasHydrated: true });
        }
    }, [allTags]);

    useEffect(() => {
        if (!usersHydrated) return;
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users', {
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                    }
                });
                const data = await response.json();
                setUsers(data.results);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        if (!allUsers || !Array.isArray(allUsers) || allUsers.length === 0) {
            fetchUsers();
        }
    }, [usersHydrated, allUsers, setUsers]);

    useEffect(() => {
        if (allUsers && allUsers.length > 0) {
            useUserListStore.setState({ hasHydrated: true });
        }
    }, [allUsers]);

    const handleCreate = async (data: MarketingCampaignFormData) => {
        const payload = transformMarketingCampaignForSave(data);
        console.log("Submitting payload:", payload);
        try {
            const tagQuery = payload.tags.map(id => `tagIds[]=${id}`).join('&');
            const clientRes = await fetch(`/api/clients?${tagQuery}`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                },
            });
            const clientData = await clientRes.json();
            const allClientIds = clientData.results.map((c: IClient) => c._id);

            const response = await fetch('/api/marketingCampaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) {
                console.error('Create failed:', result);
                return;
            }

            const createdCampaignId = result.result._id;

            await fetch('/api/campaignAudiences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TEST_JWT}`,
                },
                body: JSON.stringify({
                    campaign: createdCampaignId,
                    audience: allClientIds,
                    status: 'approved',
                }),
            });
            setSuccessOpen(true);
        } catch (error) {
            console.error('Error creating campaign:', error);
        }
    };
    console.log('Hydration flags — tags:', tagsHydrated, 'users:', usersHydrated);
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
                        <h1 className="text-2xl font-bold ml-3">Create New Campaign</h1>
                    </div>
                    <FormProvider {...form}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 w-full">
                                <CampaignFormTabs
                                    mode="new"
                                    onSubmit={handleCreate}
                                    allTags={allTags}
                                    allUsers={allUsers}
                                    form={form}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <CampaignSummary onSubmit={handleCreate} mode="new" />
                            </div>
                        </div>
                    </FormProvider>
                </div>
                <CustomAlertDialog
                    open={successOpen}
                    type="success"
                    title="Campaign Created"
                    description="The marketing campaign was successfully created."
                    confirmLabel="Go to Campaigns"
                    onConfirm={() => {
                        setSuccessOpen(false);
                        window.location.href = "/marketingCampaigns";
                    }}
                    onOpenChange={setSuccessOpen}
                />
            </main>
        </div>
    );
}
