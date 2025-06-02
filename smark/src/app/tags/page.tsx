'use client'

import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {PlusCircle} from 'lucide-react'
import Link from 'next/link'
import {useAuthStore} from '@/lib/store'
import {decodeToken} from '@/lib/utils/decodeToken'
import LoadingSpinner from '@/components/LoadingSpinner'
import PaginationControls from '@/components/PaginationControls'
import CustomAlertDialog from "@/components/CustomAlertDialog";
import SearchInput from '@/components/SearchInput'
import TagsList from '@/components/tags/TagsList'
import {ITag} from '@/types/Tag'
import {useRouter} from "next/navigation";
import BreadcrumbHeader from "@/components/BreadcrumbHeader";

export default function TagsPage() {
    const [tags, setTags] = useState<ITag[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [apiError, setApiError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [successOpen, setSuccessOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const token = useAuthStore((state) => state.token)
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null)
    const _hasHydrated = useAuthStore((state) => state._hasHydrated)
    const router = useRouter();

    const fetchTags = async (page: number = 1) => {
        try {
            setLoading(true)
            const query = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
            });
            if (searchTerm.trim() !== '') {
                query.set('name', searchTerm);
            }
            const response = await fetch(`/api/tags?page=${page}&limit=12&name=${searchTerm}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            const result = await response.json()
            console.log(result)
            if (!response.ok) {
                const errorMessage = result.message || result.error || 'Unknown error'
                setApiError(errorMessage)
                return
            }

            setTags(result.results)
            setTotalPages(result.totalPages)
            setApiError(null)
        } catch (err) {
            setApiError('Error fetching tags:' + err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!_hasHydrated) return;

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
            fetchTags(currentPage);
        };

        init();
    }, [_hasHydrated, token, currentPage])

    return (
        <>
            <div className="mx-auto mt-8 lg:px-36 lx:px-44 md:px-28 sm:px-20 px-10 transition-all duration-300 ease-in-out">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 mt-6 gap-4">
                    <BreadcrumbHeader backHref="/" title={"Tags Management"}/>
                    <Link href="/tags/new">
                        <Button variant="secondary" className="w-full sm:w-auto bg-purple-500 hover:bg-purple-800">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add New Tag
                        </Button>
                    </Link>
                </div>

                <SearchInput value={searchTerm} onChangeAction={setSearchTerm} placeholder="Search tags..."/>

                {apiError && (
                    <div className="text-center py-4 text-red-500 bg-red-100 rounded-md">{apiError}</div>
                )}

                {loading ? (
                    <LoadingSpinner/>
                ) : (
                    <>
                        <TagsList tags={tags}
                                  refresh={() => fetchTags(currentPage)}
                                  onSuccessDelete={(msg: string) => {
                                      setSuccessMessage(msg)
                                      setSuccessOpen(true)
                                  }}
                                  currentUserRole={userInfo?.role as string}
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
            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Tag deleted"
                description={successMessage}
                confirmLabel="OK"
                onConfirmAction={() => setSuccessOpen(false)}
                onOpenChangeAction={setSuccessOpen}
            />
        </>
    )
}
