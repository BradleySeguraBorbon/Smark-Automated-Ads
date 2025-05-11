'use client'

import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {PlusCircle} from "lucide-react"
import BreadcrumbHeader from "@/components/BreadcrumbHeader"
import SearchInput from "@/components/SearchInput"
import LoadingSpinner from "@/components/LoadingSpinner"
import PaginationControls from "@/components/PaginationControls"
import {useAuthStore} from '@/lib/store';
import {decodeToken} from '@/lib/utils/decodeToken';
import CustomAlertDialog from "@/components/CustomAlertDialog"
import {ITemplate} from "@/types/Template"
import TemplateRow from "@/components/templates/TemplateRow";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<ITemplate[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [successOpen, setSuccessOpen] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)

    const token = useAuthStore((state) => state.token)
    const _hasHydrated = useAuthStore((state) => state._hasHydrated)
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null)

    const router = useRouter()

    useEffect(() => {
        if (!_hasHydrated) return

        const init = async () => {
            if (!token) return router.push('/auth/login')
            const user = await decodeToken(token)
            if (!user) return router.push('/auth/login')
            if(user.role !=='developer' && user.role !== 'admin') return router.push('/')
            setUserInfo(user)
            fetchTemplates(currentPage)
        }

        init()
    }, [_hasHydrated, token, currentPage])

    const fetchTemplates = async (page: number = 1) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/templates?page=${page}&limit=10`, {
                headers: {Authorization: `Bearer ${token}`}
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.message || result.error)
            setTemplates(result.results)
            setTotalPages(result.totalPages)
            setApiError(null)
        } catch (error: any) {
            setApiError(error.message || 'Error fetching templates.')
        } finally {
            setLoading(false)
        }
    }

    const confirmDelete = (id: string) => {
        setDeletingId(id)
        setAlertOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingId) return
        try {
            const response = await fetch(`/api/templates/${deletingId}`, {
                method: 'DELETE',
                headers: {Authorization: `Bearer ${token}`},
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.message || result.error)
            setTemplates(prev => prev.filter(t => t._id !== deletingId))
            setSuccessOpen(true)
        } catch (error: any) {
            setApiError(error.message || 'Error deleting template.')
        } finally {
            setAlertOpen(false)
            setDeletingId(null)
        }
    }

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>
            <div className="max-w-6xl mx-auto mt-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 mt-6 gap-4">
                    <BreadcrumbHeader backHref='/' title='Templates Management'/>
                    {['developer', 'admin'].includes(userInfo?.role || '') && (
                        <Link href="/templates/new">
                            <Button className="w-full sm:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Add New Template
                            </Button>
                        </Link>
                    )}
                </div>

                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search templates..."/>

                {apiError && (
                    <div className="text-center py-4 text-red-500 bg-red-100 rounded-md">{apiError}</div>
                )}

                {loading ? (
                    <LoadingSpinner/>
                ) : (
                    <table className="w-full text-left border rounded-md overflow-hidden mt-6">
                        <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Type</th>
                            {/*<th className="px-4 py-3">Placeholders</th>*/}
                            <th className="px-4 py-3">Last Update</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="">
                        {filteredTemplates.map(template => (
                            <TemplateRow
                                key={template._id as string}
                                template={template}
                                userRole={userInfo?.role || ''}
                                onDelete={confirmDelete}
                            />
                        ))}
                        </tbody>
                    </table>
                )}

                {totalPages > 1 && (
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                )}
            </div>
            <CustomAlertDialog
                open={alertOpen}
                type="warning"
                title="Delete Template"
                description="Are you sure you want to delete this template? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setAlertOpen(false)}
                onOpenChange={setAlertOpen}
            />

            <CustomAlertDialog
                open={successOpen}
                type="success"
                title="Template Deleted"
                description="The template has been successfully removed."
                confirmLabel="OK"
                onConfirm={() => setSuccessOpen(false)}
                onOpenChange={setSuccessOpen}
            />

        </>
    )
}
