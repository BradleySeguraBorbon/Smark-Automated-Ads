'use client';

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Moon, Sun, MoreHorizontal } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { decodeToken } from '@/lib/utils/decodeToken';

interface NavbarProps {
    currentPath: string;
}

export function Navbar({ currentPath }: NavbarProps) {
    const fixedRoute = { href: '/', label: 'Dashboard' };
    const allRoutes = [
        { href: '/marketingCampaigns', label: 'Campaigns' },
        { href: '/adMessages', label: 'Ad-Messages' },
        { href: '/clients', label: 'Clients' },
        { href: '/users', label: 'Users' },
        { href: '/tags', label: 'Tags' },
    ];

    const { theme, setTheme } = useTheme();
    const router = useRouter();

    const token = useAuthStore((state) => state.token);
    const clearToken = useAuthStore((state) => state.clearAuth);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);

    useEffect(() => {
        if (!hasHydrated) return;
        if (!token) {
            setUserInfo(null);
            return;
        }
        decodeToken(token).then(setUserInfo);
    }, [token, hasHydrated]);

    const filteredRoutes = allRoutes.filter(
        (route) => route.href !== '/users' || (userInfo && userInfo.role !== 'employee')
    );

    const handleLogout = () => {
        clearToken();
        setUserInfo(null);
        setTimeout(() => {
            router.push('/');
        }, 10);
    };

    return (
        <div className="flex items-center justify-between w-full px-4 py-4 border-b overflow-x-auto">
            <Link href="/" className="text-lg font-bold whitespace-nowrap flex-shrink-0 mr-4">
                AutoSmark
            </Link>

            <div className="flex items-center flex-nowrap gap-2 min-w-0 overflow-hidden">
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList className="gap-2">
                        <NavigationMenuItem key={fixedRoute.href}>
                            <Link href={fixedRoute.href} legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        'px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap',
                                        currentPath === fixedRoute.href && 'bg-gray-200 dark:bg-gray-700 font-bold'
                                    )}
                                >
                                    {fixedRoute.label}
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {[fixedRoute, ...filteredRoutes].map((route) => (
                            <DropdownMenuItem key={route.href} onClick={() => router.push(route.href)}>
                                {route.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList className="gap-2">
                        {filteredRoutes.map((route) => (
                            <NavigationMenuItem key={route.href}>
                                <Link href={route.href} legacyBehavior passHref>
                                    <NavigationMenuLink
                                        className={cn(
                                            'px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap',
                                            currentPath === route.href && 'bg-gray-200 dark:bg-gray-700 font-bold'
                                        )}
                                    >
                                        {route.label}
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {userInfo ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="truncate max-w-[200px]">
                                {userInfo.username} ({userInfo.role})
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Session</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/users/${userInfo.id}`)}>
                                View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button variant="outline" onClick={() => router.push('/auth/login')}>
                        Sign In
                    </Button>
                )}
            </div>
        </div>
    );
}
