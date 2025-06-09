'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { decodeToken } from '@/lib/utils/decodeToken'

interface UserInfo {
    username: string
    role: string
    id?: string
}

export function useCurrentUserInfo() {
    const token = useAuthStore((s) => s.token)
    const _hasHydrated = useAuthStore((s) => s._hasHydrated)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [isReady, setIsReady] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!_hasHydrated) return

        const init = async () => {
            if (!token) {
                setUserInfo(null)
                router.push('/auth/login')
                return
            }

            const user = await decodeToken(token)
            if (!user) {
                router.push('/auth/login')
                return
            }

            setUserInfo(user)
            setIsReady(true)
        }

        init()
    }, [_hasHydrated, token])

    return { userInfo, isReady }
}
