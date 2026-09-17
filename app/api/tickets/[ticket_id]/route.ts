import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { TicketStatus } from "@/types/ticket";

const ALLOWED_STATUSES: TicketStatus[] = ["Open", "In Progress", "Closed"];

// ----------------------------------------------------------------------
// GET /api/tickets/{ticket_id}
// Fetch complete details of a single ticket, including its notes
// ----------------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await context.params;

    if (!ticket_id || !ticket_id.trim()) {
      return NextResponse.json(
        { error: "ticket_id parameter is required." },
        { status: 400 }
      );
    }

    // 1. Fetch ticket details
    const { data: ticket, error: ticketError } = await supabaseServer
      .from("tickets")
      .select("ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at")
      .ilike("ticket_id", ticket_id.trim())
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: `Ticket "${ticket_id}" not found.` },
        { status: 404 }
      );
    }

    // 2. Fetch associated notes in chronological order
    const { data: notes, error: notesError } = await supabaseServer
      .from("notes")
      .select("id, note_text, created_at")
      .eq("ticket_id", ticket.ticket_id)
      .order("created_at", { ascending: true });

    if (notesError) {
      console.error(`[GET /api/tickets/${ticket_id}] Notes error:`, notesError.message);
      // Still return ticket with empty notes if notes table query fails
    }

    return NextResponse.json(
      {
        ticket_id: ticket.ticket_id,
        customer_name: ticket.customer_name,
        customer_email: ticket.customer_email,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        notes: notes || [],
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error(`[GET /api/tickets/[ticket_id]] Unexpected error:`, message);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching ticket details." },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// PUT /api/tickets/{ticket_id}
// Update ticket status and optionally add a note
// ----------------------------------------------------------------------
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await context.params;

    if (!ticket_id || !ticket_id.trim()) {
      return NextResponse.json(
        { error: "ticket_id parameter is required." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { status, notes } = body;

    // Validate status
    if (!status || !ALLOWED_STATUSES.includes(status as TicketStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status "${status}". Allowed values are: Open, In Progress, Closed.`,
        },
        { status: 400 }
      );
    }

    // Validate notes if provided
    if (notes !== undefined && notes !== null) {
      if (typeof notes !== "string" || !notes.trim()) {
        return NextResponse.json(
          { error: "If provided, notes must be a non-empty string." },
          { status: 400 }
        );
      }
    }

    // 1. Verify ticket exists
    const { data: existingTicket, error: findError } = await supabaseServer
      .from("tickets")
      .select("ticket_id")
      .ilike("ticket_id", ticket_id.trim())
      .single();

    if (findError || !existingTicket) {
      return NextResponse.json(
        { error: `Ticket "${ticket_id}" not found.` },
        { status: 404 }
      );
    }

    const canonicalTicketId = existingTicket.ticket_id;
    const now = new Date().toISOString();

    // 2. Update ticket status and updated_at
    const { error: updateError } = await supabaseServer
      .from("tickets")
      .update({
        status,
        updated_at: now,
      })
      .eq("ticket_id", canonicalTicketId);

    if (updateError) {
      console.error(`[PUT /api/tickets/${ticket_id}] Update error:`, updateError.message);
      return NextResponse.json(
        { error: "Failed to update ticket in database." },
        { status: 500 }
      );
    }

    // 3. If notes provided, insert into notes table
    if (notes && typeof notes === "string" && notes.trim()) {
      const { error: insertNoteError } = await supabaseServer
        .from("notes")
        .insert({
          ticket_id: canonicalTicketId,
          note_text: notes.trim(),
          created_at: now,
        });

      if (insertNoteError) {
        console.error(
          `[PUT /api/tickets/${ticket_id}] Insert note error:`,
          insertNoteError.message
        );
        // Note: status was updated, but inserting note failed
        return NextResponse.json(
          { error: "Status was updated, but failed to record the note." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        updated_at: now,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error(`[PUT /api/tickets/[ticket_id]] Unexpected error:`, message);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the ticket." },
      { status: 500 }
    );
  }
}
