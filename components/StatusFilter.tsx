"use client";

import React from "react";
import { TicketStatus } from "@/types/ticket";
import { useTickets } from "@/context/TicketContext";

const FILTER_OPTIONS: Array<{ label: string; value: TicketStatus | "All" }> = [
  { label: "All", value: "All" },
  { label: "Open", value: "Open" },
  { label: "In Progress", value: "In Progress" },
  { label: "Closed", value: "Closed" },
];

export default function StatusFilter() {
  const { tickets, allTickets, statusFilter, setStatusFilter } = useTickets();
  const ticketList = allTickets.length > 0 ? allTickets : tickets;

  // Helper to count tickets per status
  const getCount = (status: TicketStatus | "All") => {
    if (status === "All") return ticketList.length;
    return ticketList.filter((t) => t.status === status).length;
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto max-w-full">
      {FILTER_OPTIONS.map((opt) => {
        const isSelected = statusFilter === opt.value;
        const count = getCount(opt.value);

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              isSelected
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`px-1.5 py-0.2 text-xs rounded-full font-semibold ${
                isSelected
                  ? "bg-slate-100 text-slate-700"
                  : "bg-slate-200/70 text-slate-500"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
