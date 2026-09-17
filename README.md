markdown
# Support CRM

A full-stack Customer Support Ticketing CRM System built as part of the Datastraw Technologies AI + Tech Intern assessment.

## Features

- Create support tickets with customer information
- Auto-generated ticket ID and timestamp
- List all support tickets
- Search across customer names, ticket IDs, emails, and descriptions
- Filter tickets by status
- View detailed ticket information
- Update ticket status
- Add internal notes/comments
- Client-side pagination
- Activity timeline
- Responsive frontend

## Technology Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Supabase
- PostgreSQL
- REST API

## API Endpoints

### POST /api/tickets

Creates a new support ticket.

#### Request Body

json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "subject": "Login Issue",
  "description": "Unable to log in to the account."
}


#### Response

json
{
  "ticket_id": "TKT-001",
  "created_at": "timestamp"
}


### GET /api/tickets

Returns all support tickets.

#### Optional Query Parameters

text
/api/tickets?status=Open
/api/tickets?search=John
/api/tickets?status=Open&search=John


#### Response

json
[
  {
    "ticket_id": "TKT-001",
    "customer_name": "John Doe",
    "subject": "Login Issue",
    "status": "Open",
    "created_at": "timestamp"
  }
]


### GET /api/tickets/{ticket_id}

Returns detailed information for a specific ticket.

#### Example

text
GET /api/tickets/TKT-001


#### Response

json
{
  "ticket_id": "TKT-001",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "subject": "Login Issue",
  "description": "Unable to log in to the account.",
  "status": "Open",
  "notes": []
}


### PUT /api/tickets/{ticket_id}

Updates the ticket status and adds an internal note.

#### Example

text
PUT /api/tickets/TKT-001


#### Request Body

json
{
  "status": "In Progress",
  "notes": "Investigating the reported issue."
}


#### Response

json
{
  "success": true,
  "updated_at": "timestamp"
}


## Database

The application uses two tables.

### tickets

text
id
ticket_id
customer_name
customer_email
subject
description
status
created_at
updated_at


### notes

text
id
ticket_id
note_text
created_at


The `notes.ticket_id` field references the corresponding `tickets.ticket_id`.

## Environment Variables

Create a `.env.local` file in the project root.

env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key


Do not commit `.env.local` or real credentials to the repository.

Use `.env.example` as the environment variable template.

## Getting Started

### 1. Install Dependencies

bash
npm install


### 2. Configure Environment Variables

Create a `.env.local` file in the project root and add the required Supabase credentials.

### 3. Run the Development Server

bash
npm run dev

The application will run locally on:


http://localhost:3000

## Project Structure

text
datastraw-assignment/
│
├── app/
│   ├── api/
│   │   └── tickets/
│   │       ├── route.ts
│   │       └── [ticket-id]/
│   │           └── route.ts
│   │
│   ├── tickets/
│   │   └── [ticket-id]/
│   │       └── page.tsx
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│
├── context/
│
├── lib/
│
├── types/
│
├── public/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
└── README.md

## Bonus Features

### Client-Side Pagination

Client-side pagination was added to improve usability when working with a larger number of tickets. Pagination is implemented on the frontend without changing the existing API or database schema.

### Activity Timeline

An activity timeline was added to the ticket detail page to provide a clearer view of ticket creation and internal notes using the data already available through the existing application.

The timeline does not create or display historical status changes that are not stored by the current database.

## Development Approach

AI tools were used as development assistance during the implementation, debugging, and development process.

The generated code was reviewed, modified, and integrated as part of the development process.

"# datastraw-assigment" 
