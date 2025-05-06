'use client'

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from "@/components/ui/navigation-menu";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {useAuthStore} from "@/lib/store";
import {useEffect, useState} from "react";
import {decodeToken} from '@/lib/utils/decodeToken';

interface NavbarProps {
    currentPath: string;
}

export function Navbar(
    {currentPath}: NavbarProps
) {
    const routes = [
        {href: "/", label: "Dashboard"},
        {href: "/marketingCampaigns", label: "Campaigns"},
        {href: "/adMessages", label: "Ad-Messages"},
        {href: "/clients", label: "Clients"},
        {href: "/tags", label: "Tags"}
    ];

    const {theme, setTheme} = useTheme();
    const router = useRouter();
console.log("Antes de useAuthStore")
    const token = useAuthStore((state) => state.token);
    const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);

    const hasHydrated = useAuthStore((state) => state._hasHydrated);

    useEffect(() => {
        if (!hasHydrated) {
            console.log("Esperando hidratación...");
            return;
        }

        console.log("Token después de hidratar:", token);

        if (!token) {
            setUserInfo(null);
            return;
        }

        async function checkToken() {
            console.log("Antes de decodeToken");
            const user = await decodeToken(token);
            console.log("User: ", user);
            setUserInfo(user);
        }

        checkToken();
    }, [token, hasHydrated]);


    return (
        <div className="flex items-center justify-between px-5 py-4 border-b">
            <Link href="/" className="text-lg font-bold">
                AutoSmark
            </Link>

            <NavigationMenu>
                <NavigationMenuList className="gap-3">
                    {routes.map((route) => (
                        <NavigationMenuItem key={route.href}>
                            <Link href={route.href} legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        "px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                                        currentPath === route.href && "bg-gray-200 dark:bg-gray-700 font-bold"
                                    )}
                                >
                                    {route.label}
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-4">
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
                    <Button variant="outline" onClick={() => router.push(`/users/${userInfo.id}`)}>
                        {userInfo.username} ({userInfo.role})
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => router.push("/auth/login")}>
                        Sign In
                    </Button>
                )}
            </div>
        </div>
    );
}
