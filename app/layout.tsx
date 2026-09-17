import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TicketProvider } from "@/context/TicketContext";
import Toast from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Support CRM | Customer Support Ticketing System",
  description: "Professional Customer Support Ticketing CRM - Manage, track, and resolve customer support tickets.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Support CRM | Customer Support Ticketing System",
    description: "Professional Customer Support Ticketing CRM - Manage, track, and resolve customer support tickets.",
    images: [
      {
        url: "/icon.svg",
        width: 48,
        height: 48,
        alt: "Support CRM LifeBuoy Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Support CRM | Customer Support Ticketing System",
    description: "Professional Customer Support Ticketing CRM - Manage, track, and resolve customer support tickets.",
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans"
      >
        <TicketProvider>
          {children}
          <Toast />
        </TicketProvider>
      </body>
    </html>
  );
}
