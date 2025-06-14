'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { decodeToken } from '@/lib/utils/decodeToken'
import { useRouter } from 'next/navigation'
import { useAdMessageStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { IAdMessage } from '@/types/AdMessage'
import PaginationControls from '@/components/PaginationControls'
import LoadingSpinner from '@/components/LoadingSpinner'
import { AdMessageCard } from '@/components/adMessages/AdMessageCard'
import SearchInput from "@/components/SearchInput";

export default function AdMessagesPage() {
  const router = useRouter();

  const token = useAuthStore((state) => state.token);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const adMessages = useAdMessageStore((state) => state.adMessages);
  const setAdMessages = useAdMessageStore((state) => state.setAdMessages);
  const clearAdMessages = useAdMessageStore((state) => state.clearAdMessages);
  const messagesHydrated = useAdMessageStore((state) => state.hasHydrated);

  const fetchAdMessages = async (name: string = '') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/adMessages?page=${currentPage}&limit=10&name=${name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json();
      setAdMessages(data.results as IAdMessage[]);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch ad messages:', error);
      clearAdMessages();
    } finally {
      setLoading(false);
      useAdMessageStore.setState({ hasHydrated: true })
    }
  }

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const init = async () => {
      const user = await decodeToken(token)
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUserInfo(user);
    }

    init();
  }, [_hasHydrated, token]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const run = async () => {
      await fetchAdMessages(searchTerm);
      setHasFetched(true);
    }

    run();
  }, [_hasHydrated, token, userInfo, currentPage, searchTerm]);


  const handleDelete = async (adMessageId: string) => {
    try {
      const response = await fetch(`/api/adMessages/${adMessageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete ad message');
      }

      const updatedMessages = adMessages.filter((m: IAdMessage) => m._id !== adMessageId);
      setAdMessages(updatedMessages);
    } catch (error) {
      console.error('Error deleting ad message:', error);
    }
  }

  const initialLoading = !messagesHydrated || !_hasHydrated || !hasFetched || !userInfo;

  if (initialLoading) return <LoadingSpinner />;

  return (
      <div>
        <main>
          <div className="container mx-auto py-8 lg:px-44 md:px-20 px-10 transition-all duration-300 ease-in-out">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Ad Messages</h1>
                <p className="text-muted-foreground">Manage your email and telegram messages</p>
              </div>
              <div className="flex gap-4">
                {userInfo?.role !== 'employee' && (
                    <Button className="bg-purple-700 hover:bg-purple-900 text-white" asChild>
                      <Link href="/adMessages/new">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Ad
                      </Link>
                    </Button>
                )}
              </div>
            </div>

            <SearchInput
                value={searchTerm}
                onDebouncedChange={(val) => {
                  if (val !== searchTerm) {
                    setSearchTerm(val);
                    setCurrentPage(1);
                  }
                }}
                placeholder="Search ad messages by name"
            />

            {loading ? (
                <div className="mt-10 text-center text-muted-foreground">Loading ad messages...</div>
            ) : adMessages.length === 0 ? (
                <div className="mt-10 text-center text-muted-foreground">No matching ad messages found.</div>
            ) : (
                <>
                  <div className="grid gap-6">
                    {adMessages.map((message) => (
                        <AdMessageCard
                            key={String(message._id)}
                            adMessage={message}
                            onDelete={() => handleDelete(String(message._id))}
                            userRole={userInfo?.role as string}
                        />
                    ))}
                  </div>

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
  );
}
