import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from "@/components/ui/navigation-menu";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface NavbarProps {
    currentPath: string;
    routes: Array<{ href: string; label: string }>;
}

export function Navbar(
    { currentPath, routes }: NavbarProps
) {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center justify-between px-50 py-4 border-b">
            <Link href="/" className="text-lg font-bold">
                AutoSmark
            </Link>

            <NavigationMenu>
                <NavigationMenuList className="gap-5">
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
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
                <Button variant="outline">
                    Sign In
                </Button>
            </div>
        </div>
    );
}