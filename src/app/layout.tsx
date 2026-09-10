import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "PM Buddy — AI Operations & Governance Platform",
  description: "Enterprise multi-tenant operational intelligence and governance system.",
  icons: {
    icon: [
      { url: "/pmrg-logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/pmrg-logo.png",
    apple: "/pmrg-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
