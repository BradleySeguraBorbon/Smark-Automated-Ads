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
        <div className="mb-6 relative mt-4">
            <Link href={backHref}>
                <Button variant="ghost" size="sm" className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </Link>
            <h1 className="text-3xl font-bold text-center">{title}</h1>
        </div>
    )
}
