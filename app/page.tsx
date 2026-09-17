"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StatusFilter from "@/components/StatusFilter";
import TicketList from "@/components/TicketList";
import CreateTicketModal from "@/components/CreateTicketModal";

export default function HomePage() {
  // State to control the Create Ticket dialog modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Application Header */}
      <Header onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      {/* Main Dashboard Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Toolbar */}
        <section className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full md:w-80 lg:w-96">
            <SearchBar />
          </div>
          <div className="flex items-center">
            <StatusFilter />
          </div>
        </section>

        {/* Tickets List / Table */}
        <section>
          <TicketList />
        </section>
      </main>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
