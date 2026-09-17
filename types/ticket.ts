// Allowed status values required by Datastraw
export type TicketStatus = "Open" | "In Progress" | "Closed";

// Structure for internal notes/comments attached to a ticket in Supabase
export interface TicketNote {
  id: number | string;
  note_text: string;
  created_at: string;
}

// Summary item returned by GET /api/tickets
export interface TicketListItem {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
  customer_email?: string;
}

// Full ticket structure returned by GET /api/tickets/{ticket_id}
export interface TicketDetails {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at?: string;
  notes: TicketNote[];
}

// Alias for general Ticket compatibility
export type Ticket = TicketDetails;

// Payload to create a ticket via POST /api/tickets
export interface CreateTicketInput {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
}
