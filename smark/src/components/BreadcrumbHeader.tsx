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
            <Link href={backHref}>
                <Button variant="ghost" size="sm">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </Link>
            <h1 className="text-3xl font-bold ml-4">{title}</h1>
        </div>
    )
}
