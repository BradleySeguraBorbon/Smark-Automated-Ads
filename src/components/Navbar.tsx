import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun, MoreHorizontal, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/store";
import { decodeToken } from "@/lib/utils/decodeToken";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CustomAlertDialog from '@/components/CustomAlertDialog';
import Cookies from 'js-cookie';

const getInitials = (username: string) => username.slice(0, 2).toUpperCase();

interface NavbarProps {
    currentPath: string;
}

export function Navbar({ currentPath }: NavbarProps) {
    const allRoutes = [
        { href: "/", label: "Dashboard" },
        { href: "/marketingCampaigns", label: "Campaigns" },
        { href: "/adMessages", label: "Ad-Messages" },
        { href: "/clients", label: "Clients" },
        { href: "/users", label: "Users" },
        { href: "/tags", label: "Tags" },
        { href: "/templates", label: "Templates" },
    ];

    const publicClientRoute = { href: "/clients/create", label: "Participate" };

    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const clearToken = useAuthStore((state) => state.clearAuth);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(allRoutes.length);

    useEffect(() => {
        if (!hasHydrated) return;
        if (!token) {
            setUserInfo(null);
            return;
        }
        decodeToken(token).then(setUserInfo);
    }, [token, hasHydrated]);

    const filteredRoutes = allRoutes.filter(
        (route) => route.href !== "/users" || (userInfo && userInfo.role !== "employee")
    );

    useEffect(() => {
        const updateVisibleRoutes = () => {
            const width = window.innerWidth - 200;
            const routeWidth = 65;
            const baseWidth = 500;
            const available = width - baseWidth;
            const maxRoutes = Math.floor(available / routeWidth);

            const count = Math.max(0, Math.min(filteredRoutes.length, maxRoutes));
            setVisibleCount(count);
        };

        if (userInfo) {
            updateVisibleRoutes();
            window.addEventListener("resize", updateVisibleRoutes);
            return () => window.removeEventListener("resize", updateVisibleRoutes);
        }
    }, [userInfo, filteredRoutes.length]);

    const visibleRoutes = filteredRoutes.slice(0, visibleCount);
    const hiddenRoutes = filteredRoutes.slice(visibleCount);

    return (
        <div className="flex items-center justify-between w-full px-4 py-4 min-h-[96px] border-b overflow-x-auto bg-blue-500 dark:bg-[#0a0a0a]">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-4">
                <img src="/smark.svg" alt="S" className="h-8 w-8" />
                <span className="text-lg font-bold whitespace-nowrap hidden sm:inline">
                    AutoSmark
                </span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 max-h-[5.5rem] overflow-hidden">
                <NavigationMenu className="hidden md:flex lg:flex">
                    <NavigationMenuList className="gap-2">
                        {userInfo ? (
                            visibleRoutes.map((route) => (
                                <NavigationMenuItem key={route.href}>
                                    <Link href={route.href} legacyBehavior passHref>
                                        <NavigationMenuLink
                                            className={cn(
                                                'px-5 py-2 text-sm font-medium rounded-md hover:bg-blue-600 dark:hover:bg-gray-800 whitespace-nowrap',
                                                currentPath === route.href &&
                                                '!bg-blue-800 !dark:bg-gray-700 !font-bold !text-white'
                                            )}
                                        >
                                            {route.label}
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            ))
                        ) : (
                            <NavigationMenuItem key={publicClientRoute.href}>
                                <Link href={publicClientRoute.href} legacyBehavior passHref>
                                    <NavigationMenuLink
                                        className={cn(
                                            'px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap',
                                            currentPath === publicClientRoute.href &&
                                            'bg-gray-200 dark:bg-gray-700 font-bold'
                                        )}
                                    >
                                        {publicClientRoute.label}
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        )}
                    </NavigationMenuList>
                </NavigationMenu>

                {userInfo && hiddenRoutes.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="default">
                                <MoreHorizontal className="h-5 w-5 ml-1" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {hiddenRoutes.map((route) => (
                                <DropdownMenuItem key={route.href} onClick={() => router.push(route.href)}>
                                    {route.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {userInfo ? (
                    <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl shadow-md">
                        <Avatar>
                            <AvatarFallback>
                                {userInfo?.username ? getInitials(userInfo.username) : ""}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:flex flex-col max-w-[160px]">
                            <span className="font-medium text-sm text-foreground truncate">{userInfo.username}</span>
                            <span className="text-xs text-muted-foreground truncate">{userInfo.role}</span>
                        </div>
                        <Button
                            onClick={() => setLogoutDialogOpen(true)}
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="sr-only">Log out</span>
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" onClick={() => router.push("/auth/login")}>Sign In</Button>
                )}
            </div>

            <CustomAlertDialog
                open={logoutDialogOpen}
                onOpenChangeAction={setLogoutDialogOpen}
                type="warning"
                title="Cerrar sesión"
                description="¿Estás seguro de que deseas cerrar tu sesión actual?"
                confirmLabel="Cerrar sesión"
                cancelLabel="Cancelar"
                onConfirmAction={() => {
                    setLogoutDialogOpen(false);
                    clearToken();
                    Cookies.remove('token');
                    setUserInfo(null);
                    setTimeout(() => {
                        router.push('/');
                    }, 10);
                }}
                onCancelAction={() => setLogoutDialogOpen(false)}
            />
        </div>
    );
}
