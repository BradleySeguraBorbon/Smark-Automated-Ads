'use client'

import { useState } from 'react'
import { IUser } from '@/types/User'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteUser } from './hooks/useDeleteUser'
import UserCardBody from './UserCardBody'
import CustomAlertDialog from '@/components/CustomAlertDialog'

interface Props {
    user: IUser
    currentUserRole: string
    currentUserId?: string
    onDeleteAction: (id: string) => void
}

export default function UserCard({
                                     user,
                                     currentUserRole,
                                     currentUserId,
                                     onDeleteAction
                                 }: Props) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

    const {
        feedbackDialog,
        setFeedbackDialog,
        handleDelete
    } = useDeleteUser(user._id as string, onDeleteAction)

    const canDelete =
        (currentUserRole === 'developer' ||
            (currentUserRole === 'admin' && user.role === 'employee')) &&
        user._id !== currentUserId

    return (
        <>
            <UserCardBody user={user}>
                {canDelete && (
                    <Button
                        variant="secondary"
                        className="bg-teal-600 hover:bg-teal-800"
                        size="icon"
                        onClick={() => setConfirmDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                )}
            </UserCardBody>

            <CustomAlertDialog
                open={confirmDialogOpen}
                type="warning"
                title="Confirm Deletion"
                description={`Are you sure you want to delete ${user.username}? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirmAction={() => {
                    handleDelete()
                    setConfirmDialogOpen(false)
                }}
                onCancelAction={() => setConfirmDialogOpen(false)}
                onOpenChangeAction={setConfirmDialogOpen}
            />

            <CustomAlertDialog
                open={feedbackDialog.open}
                type={feedbackDialog.type}
                title={feedbackDialog.title}
                description={feedbackDialog.description}
                confirmLabel="OK"
                onConfirmAction={() => setFeedbackDialog({ ...feedbackDialog, open: false })}
                onOpenChangeAction={(open) => setFeedbackDialog((prev) => ({ ...prev, open }))}
            />
        </>
    )
}
