'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

import { IAdMessage } from '@/types/AdMessage';
import { useAuthStore } from '@/lib/store';
import { decodeToken } from '@/lib/utils/decodeToken';

import AdMessageHeader from '@/components/adMessages/details/AdMessageHeader';
import AdMessageInfoTabs from '@/components/adMessages/details/AdMessageInfoTabs';

export default function AdMessageDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [adMessage, setAdMessage] = useState<IAdMessage | null>(null);
    const [loading, setLoading] = useState(true);

    const token = useAuthStore((state) => state.token);
    const hydrated = useAuthStore((state) => state._hasHydrated);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);

    const fetchAdMessage = async () => {
        try {
            const res = await fetch(`/api/adMessages/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch ad message');
            const data = await res.json();
            setAdMessage(data.result);
        } catch (err) {
            console.error(err);
            setAdMessage(null);
        } finally {
            setLoading(false);
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
            fetchAdMessage();
        };

        init();
    }, [id, token, hydrated]);

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <LoadingSpinner />
            </div>
        );
    }

    if (!adMessage) return notFound();

    return (
        <main>
            <div className="container mx-auto py-8 px-50">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Button variant="ghost" size="sm" asChild className="mr-2">
                            <Link href="/adMessages">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">{adMessage.name}</h1>
                    </div>
                    {userInfo?.role !== 'employee' && (
                        <Button asChild className="bg-blue-600 hover:bg-blue-800 text-white" size="sm">
                            <Link href={`/adMessages/${adMessage._id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Message
                            </Link>
                        </Button>
                    )}
                </div>

                <AdMessageHeader adMessage={adMessage} />
                <AdMessageInfoTabs adMessage={adMessage} />
            </div>
        </main>
    );
}
