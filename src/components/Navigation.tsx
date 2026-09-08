"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertOctagon,
  Bot,
  Calendar,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
  Ticket,
  BookOpen,
  Zap,
  Bell,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavigationProps {
  onCloseMobile?: () => void;
}

export function Navigation({ onCloseMobile }: NavigationProps) {
  const pathname = usePathname();
  const { currentUser, hasPermission } = useAuth();

  const allNavItems = [
    { href: "/app/dashboard", label: "Executive Dashboard", icon: LayoutDashboard, perm: "project.read" },
    { href: "/app/ai", label: "PM Buddy AI", icon: Bot, highlight: true, perm: "ai.chat" },
    { href: "/app/actions", label: "Action Center", icon: Zap, perm: "project.read" },
    { href: "/app/projects", label: "Projects & Health", icon: FolderKanban, perm: "project.read" },
    { href: "/app/tasks", label: "My Work & Tasks", icon: CheckSquare, perm: "task.read" },
    { href: "/app/tickets", label: "Incident Tickets", icon: Ticket, perm: "ticket.read" },
    { href: "/app/approvals", label: "Governance Approvals", icon: ShieldCheck, perm: "approval.read" },
    { href: "/app/risks", label: "Risk Matrix", icon: AlertOctagon, perm: "risk.read" },
    { href: "/app/calendar", label: "Calendar & Schedules", icon: Calendar, perm: "calendar.read" },
    { href: "/app/knowledge", label: "Knowledge & RAG", icon: BookOpen, perm: "knowledge.read" },
    { href: "/app/notifications", label: "Notifications", icon: Bell, perm: "project.read" },
    { href: "/app/search", label: "Global Search", icon: Search, perm: "project.read" },
    { href: "/app/settings", label: "Tenant Settings", icon: Settings, perm: "project.read" },
  ];

  // RBAC Filter: Only render items authorized for the current user persona
  const visibleNavItems = allNavItems.filter((item) => hasPermission(item.perm));

  const isAcme = currentUser?.organization_id === "11111111-1111-1111-1111-111111111111";

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80">
        <Link href="/app/dashboard" className="flex items-center gap-2.5 group">
          <img
            src="/pmrg-logo.png"
            alt="PMRG Solution LLP"
            className="h-7 w-auto object-contain"
          />
          <div>
            <h1 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>PM BUDDY</span>
              <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20">
                PRO
              </span>
            </h1>
            <p className="text-[9px] font-mono text-slate-400">PMRG Solution LLP</p>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="space-y-1 p-3 flex-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Operational Modules
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                  : item.highlight
                  ? "text-blue-400 hover:bg-slate-900 border border-blue-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tenant Context Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-xs">
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Tenant:</span>
            <strong className="text-slate-200 font-medium">
              {isAcme ? "Acme Corp" : "Globex Inc"}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Active Role:</span>
            <span className="text-blue-400 font-mono font-semibold">
              {currentUser?.role || "VIEWER"}
            </span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-center">
            RBAC Guard Active ({currentUser?.permissions.length || 0} permissions)
          </div>
        </div>
      </div>
    </aside>
  );
}
