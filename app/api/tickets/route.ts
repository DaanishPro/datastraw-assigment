import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { TicketStatus } from "@/types/ticket";

// Allowed ticket statuses
const ALLOWED_STATUSES: TicketStatus[] = ["Open", "In Progress", "Closed"];

// Helper to generate the next unique sequential ticket_id (e.g. TKT-001)
async function generateNextTicketId(): Promise<string> {
  // Query existing ticket IDs to determine the highest existing number
  const { data: existingTickets, error } = await supabaseServer
    .from("tickets")
    .select("ticket_id");

  if (error || !existingTickets || existingTickets.length === 0) {
    return "TKT-001";
  }

  let maxNumber = 0;
  for (const t of existingTickets) {
    const match = t.ticket_id?.match(/TKT-(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  const nextNumber = (maxNumber + 1).toString().padStart(3, "0");
  return `TKT-${nextNumber}`;
}

// ----------------------------------------------------------------------
// GET /api/tickets
// List tickets with optional ?status= and ?search= query parameters
// ----------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");

    let query = supabaseServer
      .from("tickets")
      .select("ticket_id, customer_name, customer_email, subject, status, created_at")
      .order("created_at", { ascending: true });

    // Validate and apply status filter if provided
    if (statusParam) {
      if (!ALLOWED_STATUSES.includes(statusParam as TicketStatus)) {
        return NextResponse.json(
          {
            error: `Invalid status "${statusParam}". Allowed values are: Open, In Progress, Closed.`,
          },
          { status: 400 }
        );
      }
      query = query.eq("status", statusParam);
    }

    // Apply search filter across name, ID, email, and description
    if (searchParam && searchParam.trim()) {
      const term = searchParam.trim();
      query = query.or(
        `customer_name.ilike.%${term}%,ticket_id.ilike.%${term}%,customer_email.ilike.%${term}%,description.ilike.%${term}%,subject.ilike.%${term}%`
      );
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error("[GET /api/tickets] Database error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch tickets from database." },
        { status: 500 }
      );
    }

    // Sort in sequential order according to ticket sequence number (e.g. TKT-001 -> TKT-021)
    const sortedTickets = (tickets || []).sort((a, b) => {
      const numA = parseInt(a.ticket_id?.replace(/\D/g, "") || "0", 10);
      const numB = parseInt(b.ticket_id?.replace(/\D/g, "") || "0", 10);
      if (numA !== numB) return numA - numB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    // Return sorted tickets with 200
    return NextResponse.json(sortedTickets, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[GET /api/tickets] Unexpected error:", message);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching tickets." },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// POST /api/tickets
// Create a new support ticket in Supabase
// ----------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { customer_name, customer_email, subject, description } = body;

    // Validate required fields
    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return NextResponse.json(
        { error: "customer_name is required and cannot be empty." },
        { status: 400 }
      );
    }

    if (!customer_email || typeof customer_email !== "string" || !customer_email.trim()) {
      return NextResponse.json(
        { error: "customer_email is required and cannot be empty." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(customer_email.trim())) {
      return NextResponse.json(
        { error: "customer_email must be a valid email address." },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { error: "subject is required and cannot be empty." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "description is required and cannot be empty." },
        { status: 400 }
      );
    }

    // Auto-generate ticket_id and timestamps
    const ticket_id = await generateNextTicketId();
    const now = new Date().toISOString();

    // Insert into Supabase tickets table (status is automatically "Open")
    const { data: insertedTicket, error: insertError } = await supabaseServer
      .from("tickets")
      .insert({
        ticket_id,
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim(),
        subject: subject.trim(),
        description: description.trim(),
        status: "Open",
        created_at: now,
        updated_at: now,
      })
      .select("ticket_id, created_at")
      .single();

    if (insertError) {
      console.error("[POST /api/tickets] Database insert error:", insertError.message);
      return NextResponse.json(
        { error: "Failed to create ticket in database." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ticket_id: insertedTicket.ticket_id,
        created_at: insertedTicket.created_at,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("[POST /api/tickets] Unexpected error:", message);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the ticket." },
      { status: 500 }
    );
  }
}
