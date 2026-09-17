"use client";

import React, { useMemo } from "react";
import { Clock, MessageSquare, PlusCircle, Info } from "lucide-react";
import { TicketDetails } from "@/types/ticket";

interface TicketActivityTimelineProps {
  ticket: TicketDetails;
  formatDisplayDate: (dateStr?: string) => string;
}

interface TimelineEvent {
  id: string;
  type: "created" | "note";
  title: string;
  badgeLabel?: string;
  subtitle?: string;
  body?: string;
  timestamp: string;
  displayDate: string;
}

export default function TicketActivityTimeline({
  ticket,
  formatDisplayDate,
}: TicketActivityTimelineProps) {
  // Derive truthful chronological activity events (creation and notes only)
  const events = useMemo<TimelineEvent[]>(() => {
    const list: TimelineEvent[] = [];

    // 1. Ticket Created event (always exists)
    if (ticket.created_at) {
      list.push({
        id: "event-created",
        type: "created",
        title: "Ticket Created",
        badgeLabel: "System",
        subtitle: `Ticket ${ticket.ticket_id} was submitted for ${ticket.customer_name}`,
        timestamp: ticket.created_at,
        displayDate: formatDisplayDate(ticket.created_at),
      });
    }

    // 2. Real internal notes
    if (ticket.notes && ticket.notes.length > 0) {
      ticket.notes.forEach((note, index) => {
        list.push({
          id: `event-note-${note.id || index}`,
          type: "note",
          title: "Internal Note",
          badgeLabel: "Staff Note",
          body: note.note_text,
          timestamp: note.created_at,
          displayDate: formatDisplayDate(note.created_at),
        });
      });
    }

    // Chronological sort: oldest first
    return list.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [ticket, formatDisplayDate]);

  return (
    <div className="space-y-6">
      {/* Activity Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-6">
        {/* Continuous vertical connecting line */}
        <div
          aria-hidden="true"
          className="absolute left-[15px] sm:left-[19px] top-4 bottom-4 w-0.5 bg-slate-200"
        />

        {events.map((evt) => {
          return (
            <div key={evt.id} className="relative group">
              {/* Circular Timeline Icon Indicator */}
              <div
                aria-hidden="true"
                className={`absolute -left-[25px] sm:-left-[31px] top-0.5 h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 bg-white ${
                  evt.type === "created"
                    ? "border-indigo-300 text-indigo-600 bg-indigo-50/70"
                    : "border-blue-300 text-blue-600 bg-blue-50/70"
                }`}
              >
                {evt.type === "created" ? (
                  <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </div>

              {/* Event Content Box */}
              <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-3.5 sm:p-4 hover:bg-slate-50 transition">
                {/* Event Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {evt.title}
                    </h3>
                    {evt.badgeLabel && (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                        {evt.badgeLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <time dateTime={evt.timestamp}>{evt.displayDate}</time>
                  </div>
                </div>

                {/* Subtitle / Description */}
                {evt.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-600 mb-1">
                    {evt.subtitle}
                  </p>
                )}

                {/* Note Content Body */}
                {evt.body && (
                  <div className="mt-2.5 p-3 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap shadow-2xs">
                    &ldquo;{evt.body}&rdquo;
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty Note State: Shown if no notes exist yet */}
        {ticket.notes && ticket.notes.length === 0 && (
          <div className="relative group pt-1">
            <div
              aria-hidden="true"
              className="absolute -left-[25px] sm:-left-[31px] top-3 h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-dashed border-slate-300 text-slate-400 bg-white flex items-center justify-center shadow-xs"
            >
              <Info className="h-3.5 w-3.5" />
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/50 border border-dashed border-slate-200 text-slate-600">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                No internal notes yet.
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Staff notes and communication updates added below will appear here chronologically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
