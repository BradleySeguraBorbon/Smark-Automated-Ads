'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'

export function NavbarWrapper() {
    const currentPath = usePathname()

    const hideOnPaths = ['/auth/login', '/auth/register','/auth/reset-password','/auth/email-login']
    if (hideOnPaths.includes(currentPath)) return null

    return <Navbar currentPath={currentPath} />
}
