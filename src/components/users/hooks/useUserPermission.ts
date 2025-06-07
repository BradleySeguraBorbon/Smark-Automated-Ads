'use client'

import { useState, useEffect } from 'react'
import { decodeToken } from '@/lib/utils/decodeToken'
import {UserFormData} from "@/types/forms";

export function useUserPermission(token: string | null) {
    const [userInfo, setUserInfo] = useState<{ username: string; role: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (!token) return

        const load = async () => {
            const user = await decodeToken(token)
            setUserInfo(user)
            setLoading(false)
            setReady(true)
        }

        load()
    }, [token])

    return {
        userInfo,
        loading,
        ready,
        isForbidden: userInfo && !['admin', 'developer'].includes(userInfo.role)
    }
}