"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/RouteGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSelectEntity = (entityType: string, id: string) => {
    switch (entityType) {
      case "project":
        router.push("/app/projects");
        break;
      case "task":
        router.push("/app/tasks");
        break;
      case "ticket":
        router.push("/app/tickets");
        break;
      case "risk":
        router.push("/app/risks");
        break;
      case "approval":
        router.push("/app/approvals");
        break;
      case "calendar":
        router.push("/app/calendar");
        break;
      case "knowledge":
        router.push("/app/knowledge");
        break;
      default:
        router.push("/app/dashboard");
        break;
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden md:flex h-full">
          <Navigation />
        </div>

        {/* Mobile Sidebar Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative z-10 w-64 h-full">
              <Navigation onCloseMobile={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            onMenuClick={() => setMobileNavOpen((prev) => !prev)}
            onSelectEntity={handleSelectEntity}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
