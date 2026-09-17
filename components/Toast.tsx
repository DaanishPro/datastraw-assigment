"use client";

import React, { useEffect } from "react";
import { useTickets } from "@/context/TicketContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast() {
  const { toast, dismissToast } = useTickets();

  // Auto-dismiss toast after 3.5 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />,
  };

  const bgMap = {
    success: "border-emerald-200 bg-white text-emerald-950",
    error: "border-red-200 bg-white text-red-950",
    info: "border-blue-200 bg-white text-blue-950",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 sm:px-0">
      <div
        role="alert"
        className={`flex items-center justify-between gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 ${bgMap[toast.type]}`}
      >
        <div className="flex items-center gap-3">
          {iconMap[toast.type]}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
