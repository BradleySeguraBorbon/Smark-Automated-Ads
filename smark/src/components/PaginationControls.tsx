"use client"

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    const pages = []

    for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
    }

    return (
        <Pagination className="mt-6">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) {
                                onPageChange(currentPage - 1)
                            }
                        }}
                        aria-disabled={currentPage === 1}
                    />
                </PaginationItem>

                {pages.map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                                e.preventDefault()
                                onPageChange(page)
                            }}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) {
                                onPageChange(currentPage + 1)
                            }
                        }}
                        aria-disabled={currentPage === totalPages}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
