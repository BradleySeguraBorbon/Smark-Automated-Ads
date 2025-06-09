"use client"

import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {PlusCircle} from "lucide-react"
import Link from "next/link"
import {IClient} from "@/types/Client"
import ClientsList from "@/components/clients/ClientList"
import { FileInput } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner"
import PaginationControls from "@/components/PaginationControls"
import {useAuthStore} from '@/lib/store';
import {decodeToken} from "@/lib/utils/decodeToken";
import {useRouter} from "next/navigation";
import BreadcrumbHeader from "@/components/BreadcrumbHeader";
import CustomAlertDialog from "@/components/CustomAlertDialog";
import ClientImportModal from "@/components/clients/ClientImportModal";

export default function ClientsPage() {
    const [apiError, setApiError] = useState<string | null>(null);
    const [fetchedClients, setFetchedClients] = useState<IClient[]>([]);
    const [loadingIds, setLoadingIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showImportModal, setShowImportModal] = useState(false);
    const [importSuccessMessage, setImportSuccessMessage] = useState('');

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const router = useRouter();

    const token = useAuthStore((state) => state.token);
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);

    const fetchClients = async (page: number = 1) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/clients?page=${page}&limit=9`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json()

            if (!response.ok) {
                console.error("Error: ",result)
                const errorMessage = result.message || result.error || 'Unknown error occurred'
                setApiError(errorMessage)
                return
            }
            setFetchedClients(result.results)
            setTotalPages(result.totalPages)
            setApiError(null)
        } catch (error) {
            console.error('Fetch error:', error)
            setApiError('Unexpected error occurred.')
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
            fetchClients(currentPage);
        };

        init();
    }, [_hasHydrated, token, currentPage]);

    const handleDelete = async (clientId: string) => {
        setLoadingIds((prev) => [...prev, clientId])

        try {
            const response = await fetch(`/api/clients/${clientId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ` + token
                },
            })

            const result = await response.json()

            if (!response.ok) {
                const errorMessage = result.message || result.error || 'Error deleting client.'
                setApiError(errorMessage)
                setErrorMessage(errorMessage)
                setShowErrorDialog(true)
            } else {
                setFetchedClients((prev) => prev.filter((client) => client._id !== clientId))
                setApiError(null)
                setShowSuccessDialog(true)
            }
        } catch (error) {
            console.error('Delete error:', error)
            setApiError('Unexpected error occurred while deleting.')
            setErrorMessage('Unexpected error occurred while deleting.')
            setShowErrorDialog(true)
        } finally {
            setLoadingIds((prev) => prev.filter((id) => id !== clientId))
        }
    }

    return (
        <div className="container mx-auto mt-8 px-10 transition-all duration-300 ease-in-out">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 mt-6 gap-4">
                <BreadcrumbHeader backHref={'/'} title={"Client Management"}/>
                {userInfo && userInfo?.role !== 'employee' && (
                    <div className="flex gap-3 justify-end">
                        <Button
                            onClick={() => setShowImportModal(true)}
                            className="bg-blue-600 hover:bg-blue-800 dark:text-white"
                        >
                            <FileInput className="mr-2 h-4 w-4" />
                            Import Clients
                        </Button>
                        <Link href="/clients/create">
                            <Button className="bg-purple-700 hover:bg-purple-900 dark:text-white">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Client
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {apiError && (
                <div className="text-center py-4 text-red-500 bg-red-100 rounded-md">{apiError}</div>
            )}

            {loading ? (
                <LoadingSpinner/>
            ) : (
                <>
                    <ClientsList clients={fetchedClients} loadingIds={loadingIds} onDeleteAction={handleDelete} userRole={userInfo?.role as string}/>
                    {totalPages > 1 && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChangeAction={(page) => setCurrentPage(page)}
                        />
                    )}
                </>
            )}
            <CustomAlertDialog
                open={showSuccessDialog}
                type="success"
                title="Client deleted successfully"
                description={importSuccessMessage || "The client was removed from the list."}
                confirmLabel="OK"
                onConfirmAction={() => setShowSuccessDialog(false)}
                onOpenChangeAction={setShowSuccessDialog}
            />

            <CustomAlertDialog
                open={showErrorDialog}
                type="error"
                title="Deletion failed"
                description={errorMessage}
                confirmLabel="Close"
                onConfirmAction={() => setShowErrorDialog(false)}
                onOpenChangeAction={setShowErrorDialog}
            />
            <ClientImportModal
                open={showImportModal}
                onCloseAction={() => setShowImportModal(false)}
                onImportSuccess={(message) => {
                    setImportSuccessMessage(message);
                    setShowSuccessDialog(true);
                    setShowImportModal(false);
                    fetchClients();
                }}
            />
        </div>
    )
}
