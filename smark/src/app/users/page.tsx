'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {PlusCircle} from 'lucide-react';
import Link from 'next/link';
import {IUser} from '@/types/User';
import UsersList from '@/components/users/UsersList';
import SearchInput from '@/components/SearchInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import PaginationControls from '@/components/PaginationControls';
import {useAuthStore} from '@/lib/store';
import {decodeToken} from '@/lib/utils/decodeToken';
import BreadcrumbHeader from "@/components/BreadcrumbHeader";
import {useRouter} from "next/navigation";

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);
    const [fetchedUsers, setFetchedUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    const token = useAuthStore((state) => state.token);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id?: string } | null>(null);
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);

    const fetchUsers = async (page: number = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/users?page=${page}&limit=10`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.message || result.error || 'Unknown error occurred';
                setApiError(errorMessage);
                return;
            }
            setFetchedUsers(result.results);
            setTotalPages(result.totalPages);
            setApiError(null);
        } catch (error) {
            console.error('Fetch error:', error);
            setApiError('Unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(!_hasHydrated) return;
        const init = async () => {
            if (!token) {
                setUserInfo(null);
                router.push('/auth/login');
                return;
            }

            const user = await decodeToken(token);
            if (!user) {
                router.push('/auth/login');
                return;
            }

            setUserInfo(user);
            fetchUsers(currentPage);
        };

        init();
    }, [_hasHydrated, token, currentPage]);

    const filteredUsers = fetchedUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto mt-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 mt-6 gap-4">
                <BreadcrumbHeader backHref="/" title="User Management"/>
                {(userInfo?.role === 'developer' || userInfo?.role === 'admin') && (
                    <Link href="/users/new">
                        <Button className="w-full sm:w-auto bg-purple-500 hover:bg-purple-800" variant="secondary">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add New User
                        </Button>
                    </Link>
                )}
            </div>

            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder={"Search Users..."}/>

            {apiError && (
                <div className="text-center py-4 text-red-500 bg-red-100 rounded-md">{apiError}</div>
            )}

            {loading ? (
                <LoadingSpinner/>
            ) : (
                <>
                    <UsersList
                        users={filteredUsers}
                        currentUserRole={userInfo?.role}
                        currentUserId={userInfo?.id}
                        onDelete={(deletedId) =>
                            setFetchedUsers((prev) => prev.filter((u) => u._id as string !== deletedId))
                        }
                    />
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
    );
}
