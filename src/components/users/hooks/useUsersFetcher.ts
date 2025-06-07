'use client'

import { useState } from 'react'
import { IUser } from '@/types/User'
import { useAuthStore } from '@/lib/store'

export function useUsersFetcher(currentPage: number) {
    const token = useAuthStore((s) => s.token)
    const [users, setUsers] = useState<IUser[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/users?page=${currentPage}&limit=10`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const result = await res.json()

            if (!res.ok) {
                setApiError(result.message || result.error || 'Unknown error occurred')
                return
            }

            setUsers(result.results)
            setTotalPages(result.totalPages)
            setApiError(null)
        } catch {
            setApiError('Unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return { loading, apiError, users, totalPages, setUsers, fetchUsers }
}
