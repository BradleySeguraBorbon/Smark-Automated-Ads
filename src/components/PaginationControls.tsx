"use client"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    onPageChangeAction: (page: number) => void
}

function getPageNumbers(current: number, total: number): (number | string)[] {
    const visiblePages = 4;
    const pages: (number | string)[] = [];

    if (total <= visiblePages) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        const left = Math.max(2, current - 2);
        const right = Math.min(total - 1, current + 2);

        pages.push(1);

        if (left > 2) {
            pages.push("...");
        }

        for (let i = left; i <= right; i++) {
            pages.push(i);
        }

        if (right < total - 1) {
            pages.push("...");
        }

        pages.push(total);
    }

    return pages;
}

export default function PaginationControls({ currentPage, totalPages, onPageChangeAction }: PaginationControlsProps) {
    const pages = getPageNumbers(currentPage, totalPages);

    return (
        <Pagination className="mt-6 mb-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) {
                                onPageChangeAction(currentPage - 1)
                            }
                        }}
                        aria-disabled={currentPage === 1}
                    />
                </PaginationItem>

                {pages.map((page, idx) => (
                    <PaginationItem key={idx}>
                        {typeof page === "number" ? (
                            <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => {
                                    e.preventDefault()
                                    onPageChangeAction(page)
                                }}
                            >
                                {page}
                            </PaginationLink>
                        ) : (
                            <span className="px-2 text-muted-foreground select-none">...</span>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) {
                                onPageChangeAction(currentPage + 1)
                            }
                        }}
                        aria-disabled={currentPage === totalPages}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
