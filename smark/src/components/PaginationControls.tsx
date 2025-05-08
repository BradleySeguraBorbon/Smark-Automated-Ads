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
    onPageChange: (page: number) => void
}

function getPageNumbers(current: number, total: number): (number | string)[] {
    const delta = 1;
    const range: (number | string)[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1); 

    if (left > 2) {
        range.push("...");
    }

    for (let i = left; i <= right; i++) {
        range.push(i);
    }

    if (right < total - 1) {
        range.push("...");
    }

    if (total > 1) {
        range.push(total);
    }

    return range;
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    const pages = getPageNumbers(currentPage, totalPages);

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

                {pages.map((page, idx) => (
                    <PaginationItem key={idx}>
                        {typeof page === "number" ? (
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
