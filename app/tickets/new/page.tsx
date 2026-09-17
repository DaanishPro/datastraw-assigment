"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useTickets } from "@/context/TicketContext";
import Header from "@/components/Header";

export default function NewTicketPage() {
  const router = useRouter();
  const { createTicket } = useTickets();

  // Form field states
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form error tracking
  const [errors, setErrors] = useState<{
    customerName?: string;
    customerEmail?: string;
    subject?: string;
    description?: string;
  }>({});

  const isValidEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      customerName?: string;
      customerEmail?: string;
      subject?: string;
      description?: string;
    } = {};

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required.";
    }

    if (!customerEmail.trim()) {
      newErrors.customerEmail = "Customer email is required.";
    } else if (!isValidEmail(customerEmail.trim())) {
      newErrors.customerEmail = "Please enter a valid email address.";
    }

    if (!subject.trim()) {
      newErrors.subject = "Issue title / subject is required.";
    }

    if (!description.trim()) {
      newErrors.description = "Issue description is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createTicket({
        customer_name: customerName,
        customer_email: customerEmail,
        subject: subject,
        description: description,
      });

      if (created) {
        // Navigate to the newly created ticket or back to dashboard
        router.push(`/tickets/${created.ticket_id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to ticket list</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <h1 className="text-xl font-bold text-slate-900">Create New Support Ticket</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Submit a customer request into the CRM support pipeline.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-6">
            <div>
              <label
                htmlFor="pageCustomerName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                id="pageCustomerName"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) setErrors({ ...errors, customerName: undefined });
                }}
                placeholder="e.g. Rahul Sharma"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.customerName
                    ? "border-red-300 focus:ring-red-400 bg-red-50/30"
                    : "border-slate-300 focus:ring-indigo-500 focus:border-transparent"
                }`}
              />
              {errors.customerName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pageCustomerEmail"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Customer Email <span className="text-red-500">*</span>
              </label>
              <input
                id="pageCustomerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (errors.customerEmail) setErrors({ ...errors, customerEmail: undefined });
                }}
                placeholder="e.g. rahul@gmail.com"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.customerEmail
                    ? "border-red-300 focus:ring-red-400 bg-red-50/30"
                    : "border-slate-300 focus:ring-indigo-500 focus:border-transparent"
                }`}
              />
              {errors.customerEmail && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.customerEmail}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pageSubject"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Issue Title / Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="pageSubject"
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) setErrors({ ...errors, subject: undefined });
                }}
                placeholder="e.g. Payment Failed"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.subject
                    ? "border-red-300 focus:ring-red-400 bg-red-50/30"
                    : "border-slate-300 focus:ring-indigo-500 focus:border-transparent"
                }`}
              />
              {errors.subject && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pageDescription"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="pageDescription"
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
                placeholder="Detailed description of the customer issue..."
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition resize-none ${
                  errors.description
                    ? "border-red-300 focus:ring-red-400 bg-red-50/30"
                    : "border-slate-300 focus:ring-indigo-500 focus:border-transparent"
                }`}
              />
              {errors.description && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/"
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Ticket</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
