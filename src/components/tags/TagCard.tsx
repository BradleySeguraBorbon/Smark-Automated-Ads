'use client'

import { ITag } from '@/types/Tag'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import { useAuthStore } from '@/lib/store'

interface TagCardProps {
    tag: ITag
    refreshAction: () => void
    onSuccessDelete?: (msg: string) => void
    currentUserRole:string
}

export default function TagCard({ tag, refreshAction, onSuccessDelete, currentUserRole }: TagCardProps) {
    const [alertOpen, setAlertOpen] = useState(false)
    const token = useAuthStore(state => state.token)

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/tags/${tag._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            const result = await res.json()

            if (!res.ok) {
                console.error(result)
                return
            }

            refreshAction()
            onSuccessDelete?.(`Tag "${tag.name}" was deleted successfully.`)
        } catch (err) {
            console.error('Error deleting tag:', err)
        } finally {
            setAlertOpen(false)
        }
    }

    return (
        <>
            <Card className="relative hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row justify-between items-start gap-2 flex-wrap">
                    <CardTitle className="truncate max-w-[70%]">{tag.name}</CardTitle>

                    <div className="flex gap-2 flex-shrink-0 max-w-full">
                        {currentUserRole !== 'employee' && (
                            <Link href={`/tags/${tag._id}/edit`}>
                                <Button
                                    variant="secondary"
                                    className="bg-blue-500 hover:bg-blue-800 shrink-0"
                                    size="icon"
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                            </Link>
                        )}
                        {currentUserRole !== 'employee' && (
                            <Button
                                className="bg-teal-600 hover:bg-teal-800 shrink-0"
                                variant="secondary"
                                size="icon"
                                onClick={() => setAlertOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">
                        <span className="font-semibold">Keywords:</span> {tag.keywords.join(', ')}
                    </p>
                </CardContent>
            </Card>

            <CustomAlertDialog
                open={alertOpen}
                type="warning"
                title="Delete Tag"
                description={`Are you sure you want to delete "${tag.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirmAction={handleDelete}
                onCancelAction={() => setAlertOpen(false)}
                onOpenChangeAction={setAlertOpen}
            />
        </>
    )
}
