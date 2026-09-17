"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { useTickets } from "@/context/TicketContext";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
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

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setCustomerName("");
      setCustomerEmail("");
      setSubject("");
      setDescription("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  // Simple, standard email validation regex
  const isValidEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  // Form submission handler with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      customerName?: string;
      customerEmail?: string;
      subject?: string;
      description?: string;
    } = {};

    // Validate Customer Name
    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required.";
    }

    // Validate Customer Email
    if (!customerEmail.trim()) {
      newErrors.customerEmail = "Customer email is required.";
    } else if (!isValidEmail(customerEmail.trim())) {
      newErrors.customerEmail = "Please enter a valid email address (e.g. name@example.com).";
    }

    // Validate Subject / Issue Title
    if (!subject.trim()) {
      newErrors.subject = "Issue title / subject is required.";
    }

    // Validate Description
    if (!description.trim()) {
      newErrors.description = "Issue description is required.";
    }

    // If any validation errors exist, halt submission and display errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await createTicket({
        customer_name: customerName,
        customer_email: customerEmail,
        subject: subject,
        description: description,
      });

      if (result) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-ticket-title"
    >
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 id="create-ticket-title" className="text-lg font-bold text-slate-900">
              Create New Support Ticket
            </h2>
            <p className="text-xs text-slate-500">
              Fill in customer information and details of the reported issue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label
              htmlFor="customerName"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.customerName) setErrors({ ...errors, customerName: undefined });
              }}
              placeholder="e.g. Rahul Sharma"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
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

          {/* Customer Email */}
          <div>
            <label
              htmlFor="customerEmail"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Customer Email <span className="text-red-500">*</span>
            </label>
            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                if (errors.customerEmail) setErrors({ ...errors, customerEmail: undefined });
              }}
              placeholder="e.g. rahul@gmail.com"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
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

          {/* Issue Title / Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Issue Title / Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) setErrors({ ...errors, subject: undefined });
              }}
              placeholder="e.g. Payment Failed"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
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

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              placeholder="Provide a detailed description of the customer's problem..."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition resize-none ${
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

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
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
    </div>
  );
}
