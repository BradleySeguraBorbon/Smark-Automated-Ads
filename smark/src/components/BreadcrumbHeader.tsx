"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface BreadcrumbHeaderProps {
    backHref: string
    title: string
}

export default function BreadcrumbHeader({ backHref, title }: BreadcrumbHeaderProps) {
    return (
        <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" asChild className="mr-2">
                <Link href={backHref}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Link>
            </Button>
            <h1 className="text-2xl font-bold ml-3">{title}</h1>
        </div>
    );
}
