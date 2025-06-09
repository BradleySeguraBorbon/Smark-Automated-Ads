'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store'

export function useDeleteUser(
    userId: string,
    onDeleteAction: (id: string) => void
) {
    const token = useAuthStore((s) => s.token)
    const [feedbackDialog, setFeedbackDialog] = useState({
        open: false,
        type: 'success' as 'success' | 'error',
        title: '',
        description: ''
    })

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })

            const result = await res.json()

            if (!res.ok) {
                setFeedbackDialog({
                    open: true,
                    type: 'error',
                    title: 'Error',
                    description: result.message || result.error || 'Failed to delete user.'
                })
            } else {
                onDeleteAction(userId)
                setFeedbackDialog({
                    open: true,
                    type: 'success',
                    title: 'Success',
                    description: 'User deleted successfully.'
                })
            }
        } catch {
            setFeedbackDialog({
                open: true,
                type: 'error',
                title: 'Error',
                description: 'Unexpected error occurred while deleting the user.'
            })
        }
    }

    return { feedbackDialog, setFeedbackDialog, handleDelete }
}
