"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TicketPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * Builds the compact array of page numbers and ellipsis tokens to display.
 * Matches the reference design: 1 2 3 4 (5) ... 99 or 1 ... 4 5 6 ... 99
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near the beginning: 1 2 3 4 5 ... totalPages (matches reference image when on page 5)
  if (currentPage <= 5) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  // Near the end: 1 ... (totalPages-4) (totalPages-3) (totalPages-2) (totalPages-1) totalPages
  if (currentPage >= totalPages - 4) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // In the middle: 1 ... (currentPage-1) currentPage (currentPage+1) ... totalPages
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export default function TicketPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: TicketPaginationProps) {
  // If zero items, do not render pagination
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-white flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 text-sm text-slate-600">
      {/* Navigation Controls: < Previous   1 2 3 4 (5) ... 99   Next > */}
      <nav
        aria-label="Ticket List Pagination"
        className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center"
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-600 hover:text-indigo-600 cursor-pointer select-none"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pages.map((item, index) => {
            if (item === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="px-1.5 text-slate-400 font-medium select-none text-sm tracking-wider"
                >
                  ...
                </span>
              );
            }

            const isCurrent = item === currentPage;
            return (
              <button
                key={`page-${item}`}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Go to page ${item}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center cursor-pointer select-none ${
                  isCurrent
                    ? "bg-indigo-600 text-white font-semibold ring-4 ring-indigo-100 shadow-xs"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-600 hover:text-indigo-600 cursor-pointer select-none"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>

      {/* Subtle Divider between controls and count */}
      <span
        className="hidden md:inline-block h-4 w-px bg-slate-200"
        aria-hidden="true"
      />

      {/* Result Count: Showing X–Y of Z results */}
      <div className="text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap">
        Showing{" "}
        <strong className="font-semibold text-slate-800">
          {totalItems === 0 ? 0 : `${startItem}–${endItem}`}
        </strong>{" "}
        of{" "}
        <strong className="font-semibold text-slate-800">
          {totalItems.toLocaleString()}
        </strong>{" "}
        results
      </div>
    </div>
  );
}
