-- ==============================================================================
-- Datastraw Customer Support Ticketing CRM - Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes for high-performance searches and filtering
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets (ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_ticket_id ON notes (ticket_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes (created_at ASC);

-- 4. (Optional) Insert initial starter tickets if the table is currently empty
INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at)
SELECT 'TKT-001', 'Rahul Sharma', 'rahul@gmail.com', 'Payment Failed', 'My payment was deducted via UPI for order #98214, but the order status is still showing as unconfirmed on the dashboard. Please verify and update.', 'Open', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM tickets WHERE ticket_id = 'TKT-001');

INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at)
SELECT 'TKT-002', 'Ahmed Khan', 'ahmed.khan@example.com', 'Login Issue', 'Unable to sign in using Google SSO. Getting an ''authorization_failed'' error code after selecting my workplace account. Clear cache did not resolve.', 'In Progress', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours'
WHERE NOT EXISTS (SELECT 1 FROM tickets WHERE ticket_id = 'TKT-002');

INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at)
SELECT 'TKT-003', 'Sara Patel', 'sara.patel@example.com', 'Refund Request', 'Requested cancellation and refund for the annual subscription within the 14-day money-back guarantee window. Card ending in 4122.', 'Closed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '18 hours'
WHERE NOT EXISTS (SELECT 1 FROM tickets WHERE ticket_id = 'TKT-003');

INSERT INTO notes (ticket_id, note_text, created_at)
SELECT 'TKT-001', 'Customer contacted support via live chat regarding payment deduction.', NOW() - INTERVAL '1 hour 40 minutes'
WHERE NOT EXISTS (SELECT 1 FROM notes WHERE ticket_id = 'TKT-001');

INSERT INTO notes (ticket_id, note_text, created_at)
SELECT 'TKT-001', 'Payment team has been contacted to verify UPI gateway transaction status.', NOW() - INTERVAL '1 hour 15 minutes'
WHERE (SELECT COUNT(*) FROM notes WHERE ticket_id = 'TKT-001') = 1;
