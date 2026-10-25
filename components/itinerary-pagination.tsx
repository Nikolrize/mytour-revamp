"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { ItineraryPaginationProps } from "@/lib/type";

export function ItineraryPagination({
  page,
  totalPages,
  busy = false,
  label = "Itinerary pages",
  onPageChange,
}: ItineraryPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const change =
    (next: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (!busy && next >= 1 && next <= totalPages && next !== page)
        onPageChange(next);
    };

  return (
    <Pagination aria-label={label} aria-busy={busy} className="mx-0 pt-3">
      <PaginationContent className="flex-wrap justify-center gap-1">
        <PaginationItem>
          <PaginationPrevious
            href={"?page=" + (page - 1)}
            aria-disabled={busy || page === 1}
            tabIndex={busy || page === 1 ? -1 : 0}
            onClick={change(page - 1)}
            className={
              busy || page === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
        {pages.map((value, index) => (
          <PaginationItem key={value} className="flex items-center gap-1">
            {index > 0 && value - pages[index - 1] > 1 && (
              <PaginationEllipsis />
            )}
            <PaginationLink
              href={"?page=" + value}
              isActive={value === page}
              aria-label={"Page " + value}
              aria-disabled={busy}
              tabIndex={busy ? -1 : 0}
              onClick={change(value)}
              className={
                value === page
                  ? "bg-brand-blue text-white hover:bg-brand-blue-hover hover:text-white"
                  : ""
              }
            >
              {value}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={"?page=" + (page + 1)}
            aria-disabled={busy || page === totalPages}
            tabIndex={busy || page === totalPages ? -1 : 0}
            onClick={change(page + 1)}
            className={
              busy || page === totalPages
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
