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
import {
    useEffect,
    useState,
} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Moon, Sun, MoreHorizontal, LogOut} from "lucide-react";
import {useTheme} from "next-themes";
import {useAuthStore} from "@/lib/store";
import {decodeToken} from "@/lib/utils/decodeToken";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {toUpperCase} from "uri-js/dist/esnext/util";
import CustomAlertDialog from '@/components/CustomAlertDialog';
import Cookies from 'js-cookie';

interface NavbarProps {
    currentPath: string;
}

export function Navbar({currentPath}: NavbarProps) {
    const fixedRoute = {href: "/", label: "Dashboard"};
    const allRoutes = [
        {href: "/marketingCampaigns", label: "Campaigns"},
        {href: "/adMessages", label: "Ad-Messages"},
        {href: "/clients", label: "Clients"},
        {href: "/users", label: "Users"},
        {href: "/tags", label: "Tags"},
        {href: "/templates", label: "Templates"},
    ];

    const publicClientRoute = {href: "/clients/create", label: "Participate"};

    const {theme, setTheme} = useTheme();
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const clearToken = useAuthStore((state) => state.clearAuth);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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

    return (
        <div className="flex items-center justify-between w-full px-4 py-4 min-h-[96px] border-b overflow-x-auto bg-blue-500 dark:bg-[#0a0a0a]">
            <Link href="/" className="text-lg font-bold whitespace-nowrap flex-shrink-0 mr-4">
                AutoSmark
            </Link>

            <div className="flex flex-wrap items-center gap-2 max-h-[5.5rem] overflow-hidden">
                <NavigationMenu className="hidden lg:flex">
                    <NavigationMenuList className="gap-2">
                        {userInfo ? (
                            [fixedRoute, ...filteredRoutes].map((route) => (
                                <NavigationMenuItem key={route.href}>
                                    <Link href={route.href} legacyBehavior passHref>
                                        <NavigationMenuLink
                                            className={cn(
                                                'px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-600 dark:hover:bg-gray-800 whitespace-nowrap',
                                                currentPath === route.href && '!bg-blue-800 !dark:bg-gray-700 !font-bold !text-white'
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
                                            currentPath === publicClientRoute.href && 'bg-gray-200 dark:bg-gray-700 font-bold'
                                        )}
                                    >
                                        {publicClientRoute.label}
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        )}
                    </NavigationMenuList>
                </NavigationMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <MoreHorizontal className="h-5 w-5"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {userInfo ? (
                            [fixedRoute, ...filteredRoutes].map((route) => (
                                <DropdownMenuItem key={route.href} onClick={() => router.push(route.href)}>
                                    {route.label}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem onClick={() => router.push(publicClientRoute.href)}>
                                {publicClientRoute.label}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun
                        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                    <Moon
                        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {userInfo ? (
                    <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-xl shadow-md">
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarFallback>
                                    {toUpperCase(userInfo.username[0] + userInfo.username[1])}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm text-foreground truncate max-w-[160px]">
                {userInfo.username} ({userInfo.role})
              </span>
                        </div>
                        <Button
                            onClick={() => setLogoutDialogOpen(true)}
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                        >
                            <LogOut className="h-5 w-5"/>
                            <span className="sr-only">Log out</span>
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" onClick={() => router.push("/auth/login")}>
                        Sign In
                    </Button>
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
