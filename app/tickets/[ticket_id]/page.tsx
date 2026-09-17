"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  AlertCircle,
  FileText,
  Tag,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useTickets } from "@/context/TicketContext";
import { TicketDetails, TicketStatus } from "@/types/ticket";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import TicketActivityTimeline from "@/components/TicketActivityTimeline";

// Helper to format ISO timestamps into human-readable strings
function formatDisplayDate(dateStr?: string): string {
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

export default function TicketDetailsPage() {
  const params = useParams();
  const ticketId = (params.ticket_id || params.id) as string;

  const { updateTicketStatus, addTicketNote } = useTickets();

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Status and note mutation states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [noteError, setNoteError] = useState("");

  // Fetch ticket details from GET /api/tickets/{ticket_id}
  const loadTicketDetails = useCallback(async () => {
    if (!ticketId) return;

    try {
      setIsLoading(true);
      setFetchError(null);

      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: "GET",
      });

      if (res.status === 404) {
        setTicket(null);
        setFetchError(`Ticket "${ticketId}" not found.`);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch ticket (HTTP ${res.status})`);
      }

      const data: TicketDetails = await res.json();
      setTicket(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error connecting to server";
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicketDetails();
  }, [loadTicketDetails]);

  // Handle status update
  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket || isUpdatingStatus) return;

    try {
      setIsUpdatingStatus(true);
      const success = await updateTicketStatus(ticket.ticket_id, newStatus);
      if (success) {
        setTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
        await loadTicketDetails();
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Note Submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    if (!newNote.trim()) {
      setNoteError("Please type a note before submitting.");
      return;
    }

    try {
      setIsAddingNote(true);
      setNoteError("");
      const success = await addTicketNote(ticket.ticket_id, newNote.trim(), ticket.status);
      if (success) {
        setNewNote("");
        await loadTicketDetails();
      }
    } finally {
      setIsAddingNote(false);
    }
  };

  // 1. Loading State
  if (isLoading && !ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-xs">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3 animate-spin">
              <Loader2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Loading Ticket Details...</h2>
            <p className="text-xs text-slate-400">Fetching ticket information from Supabase</p>
          </div>
        </main>
      </div>
    );
  }

  // 2. Error or Not Found State
  if (fetchError || !ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-xs">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ticket Not Found</h2>
            <p className="text-sm text-slate-500 mb-6">
              {fetchError || `Could not find any ticket with ID "${ticketId}". It may have been removed or the link might be incorrect.`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => loadTicketDetails()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Tickets Dashboard</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to ticket list</span>
          </Link>

          <span className="text-xs text-slate-400 font-mono">
            ID: {ticket.ticket_id}
          </span>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-base sm:text-lg font-bold font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {ticket.ticket_id}
                </span>
                <StatusBadge status={ticket.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {ticket.subject}
              </h1>
            </div>

            {/* Status Selector Control */}
            <div className="flex flex-col sm:items-end gap-1.5 pt-2 md:pt-0">
              <label
                htmlFor="ticketStatusSelect"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1"
              >
                <Tag className="h-3.5 w-3.5" />
                <span>Update Status</span>
              </label>
              <div className="relative">
                <select
                  id="ticketStatusSelect"
                  value={ticket.status}
                  disabled={isUpdatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition shadow-xs pr-8 disabled:opacity-50"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <span className="text-[11px] text-slate-400">
                {isUpdatingStatus ? "Saving to database..." : "Changes save to database"}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Issue Description</h2>
              </div>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Activity & Notes Timeline Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Activity Timeline
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {ticket.notes.length} {ticket.notes.length === 1 ? "note" : "notes"}
                </span>
              </div>

              {/* Truthful Activity Timeline Component */}
              <TicketActivityTimeline
                ticket={ticket}
                formatDisplayDate={formatDisplayDate}
              />

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="pt-6 mt-6 border-t border-slate-200">
                <label
                  htmlFor="addNoteInput"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2"
                >
                  Add Internal Note
                </label>
                <div className="space-y-3">
                  <textarea
                    id="addNoteInput"
                    rows={3}
                    value={newNote}
                    disabled={isAddingNote}
                    onChange={(e) => {
                      setNewNote(e.target.value);
                      if (noteError) setNoteError("");
                    }}
                    placeholder="Type internal note, resolution steps, or updates here..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition resize-none disabled:opacity-50 ${
                      noteError
                        ? "border-red-300 focus:ring-red-400 bg-red-50/30"
                        : "border-slate-300 focus:ring-indigo-500 focus:border-transparent"
                    }`}
                  />
                  {noteError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {noteError}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isAddingNote}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isAddingNote ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Adding Note...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Add Note</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Customer Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <User className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Customer Details</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    Name
                  </span>
                  <p className="font-semibold text-slate-900 text-base">
                    {ticket.customer_name}
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${ticket.customer_email}`}
                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline font-medium break-all"
                  >
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{ticket.customer_email}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Ticket Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Ticket Overview</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    Status
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    Created At
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatDisplayDate(ticket.created_at)}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    Last Updated
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatDisplayDate(ticket.updated_at || ticket.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
