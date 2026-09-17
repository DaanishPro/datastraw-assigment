"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { TicketListItem, TicketStatus, CreateTicketInput } from "@/types/ticket";

interface ToastNotification {
  message: string;
  type: "success" | "info" | "error";
}

interface TicketContextType {
  tickets: TicketListItem[];
  filteredTickets: TicketListItem[];
  allTickets: TicketListItem[];
  searchQuery: string;
  statusFilter: TicketStatus | "All";
  isLoading: boolean;
  error: string | null;
  toast: ToastNotification | null;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: TicketStatus | "All") => void;
  refreshTickets: () => Promise<void>;
  createTicket: (input: CreateTicketInput) => Promise<{ ticket_id: string } | null>;
  updateTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => Promise<boolean>;
  addTicketNote: (ticketId: string, noteText: string, currentStatus?: TicketStatus) => Promise<boolean>;
  dismissToast: () => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [allTickets, setAllTickets] = useState<TicketListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "info" | "error" = "success") => {
      setToast({ message, type });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch all tickets for overall counts (Total, Open, In Progress, Closed)
  const fetchAllTicketsCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets", { method: "GET" });
      if (res.ok) {
        const data: TicketListItem[] = await res.json();
        setAllTickets(data);
      }
    } catch {
      // Ignore background count fetch failures
    }
  }, []);

  // Fetch filtered tickets from GET /api/tickets with search & status query params
  const fetchTickets = useCallback(
    async (search: string, status: TicketStatus | "All") => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (status !== "All") {
          params.set("status", status);
        }
        if (search.trim()) {
          params.set("search", search.trim());
        }

        const url = `/api/tickets${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url, { method: "GET" });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch tickets (HTTP ${res.status})`);
        }

        const data: TicketListItem[] = await res.json();
        setTickets(data);

        // If no filter or search was active, also sync allTickets
        if (status === "All" && !search.trim()) {
          setAllTickets(data);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error connecting to server";
        setError(msg);
        console.error("[TicketContext] Fetch error:", msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search and status changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchTickets(searchQuery, statusFilter);
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, statusFilter, fetchTickets]);

  // Initial load: also fetch all counts
  useEffect(() => {
    fetchAllTicketsCounts();
  }, [fetchAllTicketsCounts]);

  // Manual refresh helper
  const refreshTickets = useCallback(async () => {
    await Promise.all([
      fetchTickets(searchQuery, statusFilter),
      fetchAllTicketsCounts(),
    ]);
  }, [fetchTickets, fetchAllTicketsCounts, searchQuery, statusFilter]);

  // 1. Create ticket action via POST /api/tickets
  const createTicket = async (input: CreateTicketInput): Promise<{ ticket_id: string } | null> => {
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }

      showToast(`Ticket ${data.ticket_id} created successfully.`);
      await refreshTickets();
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create ticket";
      showToast(msg, "error");
      return null;
    }
  };

  // 2. Update ticket status via PUT /api/tickets/{ticket_id}
  const updateTicketStatus = async (
    ticketId: string,
    status: TicketStatus,
    note?: string
  ): Promise<boolean> => {
    try {
      const payload: { status: TicketStatus; notes?: string } = { status };
      if (note && note.trim()) {
        payload.notes = note.trim();
      }

      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update ticket status");
      }

      showToast(`Status updated to "${status}".`);
      await refreshTickets();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update ticket";
      showToast(msg, "error");
      return false;
    }
  };

  // 3. Add note to ticket via PUT /api/tickets/{ticket_id}
  const addTicketNote = async (
    ticketId: string,
    noteText: string,
    currentStatus: TicketStatus = "Open"
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus,
          notes: noteText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add note");
      }

      showToast("Note added successfully.");
      await refreshTickets();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add note";
      showToast(msg, "error");
      return false;
    }
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        filteredTickets: tickets,
        allTickets,
        searchQuery,
        statusFilter,
        isLoading,
        error,
        toast,
        setSearchQuery,
        setStatusFilter,
        refreshTickets,
        createTicket,
        updateTicketStatus,
        addTicketNote,
        dismissToast,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
}
