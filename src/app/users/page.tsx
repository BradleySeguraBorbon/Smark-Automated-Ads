'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useUsersFetcher } from '@/components/users/hooks/useUsersFetcher'
import { useCurrentUserInfo } from '@/components/users/hooks/useCurrentUserInfo'
import UsersList from '@/components/users/UsersList'
import SearchInput from '@/components/SearchInput'
import LoadingSpinner from '@/components/LoadingSpinner'
import PaginationControls from '@/components/PaginationControls'
import BreadcrumbHeader from '@/components/BreadcrumbHeader'

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const {
        loading,
        apiError,
        users,
        totalPages,
        setUsers,
        fetchUsers
    } = useUsersFetcher(currentPage)

    const { userInfo, isReady } = useCurrentUserInfo()

    useEffect(() => {
        if (isReady) fetchUsers()
    }, [isReady, currentPage])

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="max-w-6xl mx-auto mt-8 lg:px-36 md:px-24 px-10 transition-all duration-300 ease-in-out">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 mt-6 gap-4">
                <BreadcrumbHeader backHref="/" title="User Management" />
                {(userInfo?.role === 'developer' || userInfo?.role === 'admin') && (
                    <Link href="/users/new">
                        <Button className="w-full sm:w-auto bg-purple-700 hover:bg-purple-900" variant="secondary">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New User
                        </Button>
                    </Link>
                )}
            </div>

            <SearchInput value={searchTerm}
                         onDebouncedChange={(val) => {
                             if (val !== searchTerm) {
                                 setSearchTerm(val);
                                 setCurrentPage(1);
                             }
                         }}
                         placeholder="Search users by username"
            />

            {apiError && (
                <div className="text-center py-4 text-red-500 bg-red-100 rounded-md">{apiError}</div>
            )}

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <UsersList
                        users={filteredUsers}
                        currentUserRole={userInfo?.role}
                        currentUserId={userInfo?.id}
                        onDelete={(deletedId) =>
                            setUsers((prev) => prev.filter((u) => u._id !== deletedId))
                        }
                    />
                    {totalPages > 1 && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChangeAction={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    )
}
