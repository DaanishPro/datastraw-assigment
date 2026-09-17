# Support CRM

A full-stack Customer Support Ticketing CRM System developed as part of the Datastraw Technologies AI + Tech Intern assessment.

The application provides a simple and practical interface for creating, managing, searching, filtering, viewing, and updating customer support tickets.

## Overview

The Support CRM is designed to manage customer support tickets through a complete end-to-end workflow covering:

* Customer ticket creation
* Ticket identification and timestamps
* Ticket listing
* Search and filtering
* Ticket details
* Status management
* Internal notes and comments
* Ticket activity visibility
* Pagination for improved usability

The application follows a simple architecture with a Next.js frontend, REST API endpoints, and a Supabase PostgreSQL database.

## Core Features

### 1. Create Tickets

Users can create new support tickets by providing:

* Customer name
* Customer email
* Issue title
* Issue description

Each ticket receives:

* An automatically generated ticket ID
* A creation timestamp

### 2. List All Tickets

The home page displays the available support tickets with important information including:

* Ticket ID
* Customer name
* Subject
* Status
* Creation date

### 3. Search Tickets

The application provides quick search functionality across:

* Customer names
* Ticket IDs
* Customer emails
* Ticket descriptions

Search results update dynamically as the user types.

### 4. Filter by Status

Tickets can be filtered using the supported statuses:

* Open
* In Progress
* Closed

### 5. View Ticket Details

Each ticket has a dedicated detail page containing:

* Ticket ID
* Customer information
* Customer email
* Subject
* Description
* Current status
* Internal notes
* Ticket activity information

### 6. Update Tickets

Support tickets can be updated from the ticket detail page.

The update functionality supports:

* Changing ticket status
* Adding internal notes/comments
* Updating the ticket timestamp

### 7. Client-Side Pagination

Client-side pagination has been implemented to improve usability when handling a larger number of tickets.

Pagination is applied to the already-fetched ticket data without requiring changes to the existing database schema.

### 8. Activity Timeline

An activity timeline has been added to the ticket detail page to provide a clearer view of available ticket activity.

The timeline uses existing ticket and notes data and does not create or display historical status changes that are not stored in the database.

### 9. Responsive Design

The frontend is designed to provide a clean and usable experience across desktop and mobile screen sizes.

## Technology Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase
* PostgreSQL
* REST API
* Vercel

## Application Architecture

The application follows a simple full-stack architecture:

Frontend → Next.js UI

Backend → Next.js API Route Handlers

Database → Supabase PostgreSQL

The frontend communicates with the backend API, while the API handles ticket operations and database communication.

## API Endpoints

### POST /api/tickets

Creates a new support ticket.

Request Body:

{
"customer_name": "John Doe",
"customer_email": "[john@example.com](mailto:john@example.com)",
"subject": "Login Issue",
"description": "Unable to log in to the account."
}

Response:

{
"ticket_id": "TKT-001",
"created_at": "timestamp"
}

### GET /api/tickets

Returns the available support tickets.

Optional query parameters can be used for searching and filtering.

Examples:

/api/tickets?status=Open

/api/tickets?search=John

/api/tickets?status=Open&search=John

Response:

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

Example:

GET /api/tickets/TKT-001

Response:

{
"ticket_id": "TKT-001",
"customer_name": "John Doe",
"customer_email": "[john@example.com](mailto:john@example.com)",
"subject": "Login Issue",
"description": "Unable to log in to the account.",
"status": "Open",
"notes": []
}

### PUT /api/tickets/{ticket_id}

Updates the status of an existing ticket and can add an internal note.

Example:

PUT /api/tickets/TKT-001

Request Body:

{
"status": "In Progress",
"notes": "Investigating the reported issue."
}

Response:

{
"success": true,
"updated_at": "timestamp"
}

## Database Design

The application uses a simple two-table database structure consisting of tickets and notes.

### Tickets Table

The tickets table contains:

* id
* ticket_id
* customer_name
* customer_email
* subject
* description
* status
* created_at
* updated_at

The ticket status is restricted to:

* Open
* In Progress
* Closed

The ticket_id field is unique and is used to identify individual tickets.

### Notes Table

The notes table contains:

* id
* ticket_id
* note_text
* created_at

The notes table is related to the tickets table through ticket_id.

The relationship allows multiple notes to be associated with a ticket.

When a ticket is deleted, its associated notes are also removed through the configured relationship.

## Environment Variables

The application requires Supabase environment variables.

Create a .env.local file in the project root and provide the required Supabase credentials.

Required environment variables:

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

For the GitHub repository, a .env.example file is included with placeholder values instead of actual credentials.

Real environment variables and secret credentials must not be committed to the repository.

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* A Supabase project

### Installation

Clone the repository and install the project dependencies.

Run:

npm install

### Environment Configuration

Create a .env.local file in the project root.

Add the required Supabase project URL and server-side service role key.

### Run the Development Server

Start the Next.js development server using:

npm run dev

The application will be available at:

[http://localhost:3000](http://localhost:3000)

## Project Structure

datastraw-assignment/

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

## API and Backend Structure

The API is implemented using Next.js API Route Handlers.

The ticket API is organized into two route files:

* app/api/tickets/route.ts
* app/api/tickets/[ticket-id]/route.ts

These route handlers provide the four required REST API operations:

* POST /api/tickets
* GET /api/tickets
* GET /api/tickets/{ticket_id}
* PUT /api/tickets/{ticket_id}

This keeps the backend structure simple while supporting the complete ticket management workflow.

## Error Handling

The API validates incoming request data and handles common situations such as:

* Missing required fields
* Invalid ticket information
* Invalid ticket status
* Ticket not found
* Database operation failures
* Invalid update requests

The frontend also provides appropriate feedback when operations succeed or fail.

## Bonus Features

### Client-Side Pagination

Client-side pagination was added to improve usability when the number of tickets increases.

The implementation works on the frontend using the ticket data already retrieved from the API and does not require additional database tables or API endpoints.

### Activity Timeline

An activity timeline was added to the ticket detail page to provide a clearer representation of available ticket activity.

The timeline uses existing ticket creation and notes data.

It does not fabricate historical status changes because the current database schema does not store a separate status history or audit log.

## Development Approach

The application was developed using modern full-stack development practices with Next.js, TypeScript, Supabase, PostgreSQL, and Tailwind CSS.

AI tools were used as development assistance during implementation, debugging, problem solving, and code refinement.

AI-generated code was reviewed, understood, modified, and integrated according to the application's requirements rather than being submitted as unchanged generated code.

## Challenges Solved

During development, several implementation challenges were addressed, including:

* Connecting the Next.js API routes with Supabase PostgreSQL
* Managing server-side Supabase credentials securely through environment variables
* Implementing dynamic ticket detail routes
* Connecting frontend operations with REST API endpoints
* Implementing ticket search and status filtering
* Implementing ticket status updates and internal notes
* Maintaining a simple two-table database structure
* Implementing pagination without changing the existing API
* Displaying ticket activity using the data available in the database
* Deploying the application as a production-ready web application

## Security Considerations

Sensitive Supabase credentials are stored using environment variables.

The Supabase service role key is kept server-side and is not exposed through public environment variables.

The .env.local file is excluded from version control through .gitignore.

Only placeholder credentials are included in .env.example.

## Future Improvements

With additional development time, the following improvements could be considered:

* Persistent ticket activity and status history
* Support agent assignment
* Authentication and role-based access control
* Server-side pagination
* Multiple communication channel integrations
* Customer interaction history
* Ticket priority management
* Ticket categorization
* Notifications for ticket updates
* Advanced reporting and analytics

## Assessment Alignment

The application implements the core requirements specified in the Datastraw Technologies assessment, including:

* Full-stack web application
* Ticket creation
* Automatic ticket identification and timestamp
* Ticket listing
* Search functionality
* Status filtering
* Ticket detail view
* Ticket status updates
* Notes/comments
* Database integration
* REST API endpoints
* Responsive frontend
* Deployment
* GitHub source repository

The project also includes additional frontend improvements through client-side pagination and an activity timeline.

## License

This project was developed as part of the Datastraw Technologies AI + Tech Intern assessment.
