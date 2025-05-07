'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {PlusCircle} from 'lucide-react';
import Link from 'next/link';
import {IUser} from '@/types/User';
import UsersList from '@/components/users/UsersList';
import SearchInput from '@/components/SearchInput';
import {usePathname} from 'next/navigation';
import {Navbar} from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import PaginationControls from '@/components/PaginationControls';
import {useAuthStore} from '@/lib/store';
import {decodeToken} from '@/lib/utils/decodeToken';
import BreadcrumbHeader from "@/components/BreadcrumbHeader";
import {router} from "next/client";

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);
    const [fetchedUsers, setFetchedUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const token = useAuthStore((state) => state.token);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id?: string } | null>(null);

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
        if (!token) {
            setUserInfo(null);
            return;
        }

        async function checkToken() {
            const user = await decodeToken(token);
            setUserInfo(user);
        }

        checkToken();
        fetchUsers(currentPage);
    }, [token, currentPage]);

    const filteredUsers = fetchedUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentPath = usePathname();

    return (
        <>
            <header>
                <Navbar currentPath={currentPath}/>
            </header>
            <div className="max-w-3xl mx-auto mt-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 mt-6 gap-4">
                    <BreadcrumbHeader backHref="/users" title="Create a New User"/>
                    {(userInfo?.role === 'developer' || userInfo?.role === 'admin') && (
                        <Link href="/users/new">
                            <Button className="w-full sm:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Add New User
                            </Button>
                        </Link>
                    )}
                </div>

                <SearchInput value={searchTerm} onChange={setSearchTerm}/>

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
        </>
    );
}
