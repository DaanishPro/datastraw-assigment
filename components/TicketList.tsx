"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Calendar, User, SearchX, Inbox, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { useTickets } from "@/context/TicketContext";
import StatusBadge from "./StatusBadge";
import TicketPagination from "./TicketPagination";

// Helper to format ISO timestamps into human-readable strings
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export default function TicketList() {
  const {
    filteredTickets,
    tickets,
    searchQuery,
    statusFilter,
    isLoading,
    error,
    refreshTickets,
    setSearchQuery,
    setStatusFilter,
  } = useTickets();

  // Pagination state (10 tickets per page by default)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset to page 1 whenever search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Ensure current page remains valid when ticket dataset changes
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Derive the active page's ticket subset
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredTickets.length);
  const paginatedTickets = useMemo(() => {
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, startIndex, endIndex]);

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  // State 1: Error State
  if (error && !isLoading && tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-12 text-center shadow-xs">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Failed to load tickets</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">{error}</p>
        <button
          type="button"
          onClick={() => refreshTickets()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // State 2: Loading State
  if (isLoading && tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3 animate-spin">
          <Loader2 className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-slate-700">Loading tickets from database...</p>
        <p className="text-xs text-slate-400 mt-1">Connecting to Supabase PostgreSQL</p>
      </div>
    );
  }

  // State 3: No tickets at all in the system
  if (!isLoading && tickets.length === 0 && !searchQuery && statusFilter === "All") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No tickets found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          There are currently no tickets in the support system. Click &quot;Create Ticket&quot; above to add your first customer issue.
        </p>
      </div>
    );
  }

  // State 4: No tickets match search or filter criteria
  if (filteredTickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mx-auto mb-4">
          <SearchX className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No tickets match your search</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
          {searchQuery
            ? `No tickets found matching "${searchQuery}"${
                statusFilter !== "All" ? ` with status "${statusFilter}"` : ""
              }.`
            : `No tickets found with status "${statusFilter}".`}
        </p>
        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
        >
          Reset filters & search
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden relative">
      {/* Subtle indicator if re-fetching in background */}
      {isLoading && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-indigo-600 animate-pulse" />
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="py-3.5 pl-6 pr-3">
                Ticket ID
              </th>
              <th scope="col" className="py-3.5 px-3">
                Customer Name
              </th>
              <th scope="col" className="py-3.5 px-3">
                Issue / Subject
              </th>
              <th scope="col" className="py-3.5 px-3">
                Status
              </th>
              <th scope="col" className="py-3.5 px-3">
                Created Date
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {paginatedTickets.map((ticket) => (
              <tr
                key={ticket.ticket_id}
                className="group hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-4 pl-6 pr-3 font-semibold text-indigo-600 whitespace-nowrap">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="hover:underline flex items-center gap-1.5"
                  >
                    <span>{ticket.ticket_id}</span>
                  </Link>
                </td>
                <td className="py-4 px-3 whitespace-nowrap">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="block group/link"
                  >
                    <span className="font-medium text-slate-900 group-hover/link:text-indigo-600 group-hover/link:underline transition-colors">
                      {ticket.customer_name}
                    </span>
                    {ticket.customer_email && (
                      <span className="block text-xs font-normal text-slate-400">
                        {ticket.customer_email}
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-4 px-3 text-slate-700 max-w-md">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="block group/link"
                  >
                    <span className="font-medium text-slate-900 line-clamp-1 group-hover/link:text-indigo-600 group-hover/link:underline transition-colors">
                      {ticket.subject}
                    </span>
                  </Link>
                </td>
                <td className="py-4 px-3 whitespace-nowrap">
                  <Link href={`/tickets/${ticket.ticket_id}`} className="block">
                    <StatusBadge status={ticket.status} />
                  </Link>
                </td>
                <td className="py-4 px-3 text-xs text-slate-500 whitespace-nowrap">
                  <Link href={`/tickets/${ticket.ticket_id}`} className="block">
                    {formatDisplayDate(ticket.created_at)}
                  </Link>
                </td>
                <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg border border-indigo-100 transition-colors"
                  >
                    <span>View / Update</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-slate-200">
        {paginatedTickets.map((ticket) => (
          <Link
            key={ticket.ticket_id}
            href={`/tickets/${ticket.ticket_id}`}
            className="block p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-indigo-600">
                {ticket.ticket_id}
              </span>
              <StatusBadge status={ticket.status} size="sm" />
            </div>

            <h4 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-1">
              {ticket.subject}
            </h4>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium text-slate-700 truncate max-w-[120px]">
                  {ticket.customer_name}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatDisplayDate(ticket.created_at).split(",")[0]}</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Footer */}
      <TicketPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredTickets.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
