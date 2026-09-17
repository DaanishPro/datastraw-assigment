"use client";

import React from "react";
import { LifeBuoy, Plus, Ticket as TicketIcon } from "lucide-react";
import Link from "next/link";
import { useTickets } from "@/context/TicketContext";

interface HeaderProps {
  onOpenCreateModal?: () => void;
}

export default function Header({ onOpenCreateModal }: HeaderProps) {
  const { tickets, allTickets } = useTickets();
  const ticketList = allTickets.length > 0 ? allTickets : tickets;

  // Calculate quick metrics for the support team
  const openCount = ticketList.filter((t) => t.status === "Open").length;
  const inProgressCount = ticketList.filter((t) => t.status === "In Progress").length;
  const closedCount = ticketList.filter((t) => t.status === "Closed").length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:h-20 gap-4">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm hover:bg-indigo-700 transition-colors flex-shrink-0"
              title="Support CRM Home"
            >
              <LifeBuoy className="h-6 w-6" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight hover:text-indigo-600 transition-colors">
                  Support CRM
                </Link>
                <span className="text-xs px-2 py-0.5 font-medium bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">
                  Internal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Manage and track customer support tickets
              </p>
            </div>
          </div>

          {/* Action Area & Quick Stats */}
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            {/* Ticket Counter Badges */}
            <div className="hidden md:flex items-center gap-3 text-xs font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
              <span className="flex items-center gap-1.5">
                <TicketIcon className="h-3.5 w-3.5 text-slate-400" />
                <strong className="text-slate-900">{ticketList.length}</strong> Total
              </span>
              <span className="h-3.5 w-px bg-slate-200" aria-hidden="true" />
              <span className="text-amber-700">
                <strong>{openCount}</strong> Open
              </span>
              <span className="h-3.5 w-px bg-slate-200" aria-hidden="true" />
              <span className="text-blue-700">
                <strong>{inProgressCount}</strong> In Progress
              </span>
              <span className="h-3.5 w-px bg-slate-200" aria-hidden="true" />
              <span className="text-emerald-700">
                <strong>{closedCount}</strong> Closed
              </span>
            </div>

            {/* Create Ticket Button */}
            {onOpenCreateModal ? (
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                <span>Create Ticket</span>
              </button>
            ) : (
              <Link
                href="/tickets/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition shadow-sm"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                <span>Create Ticket</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
