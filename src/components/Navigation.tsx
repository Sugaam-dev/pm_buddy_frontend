"use client";

import React from "react";
import {
  AlertOctagon,
  Bot,
  Calendar,
  CheckSquare,
  Clock,
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
  Ticket,
  Lock,
  BookOpen,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export type NavTab =
  | "pm_buddy"
  | "action_center"
  | "dashboard"
  | "projects"
  | "tasks"
  | "tickets"
  | "approvals"
  | "risks"
  | "calendar"
  | "knowledge";

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const { currentUser, hasPermission } = useAuth();

  const allNavItems = [
    { id: "pm_buddy" as NavTab, label: "PM Buddy AI", icon: Bot, highlight: true, perm: "ai.chat" },
    { id: "action_center" as NavTab, label: "Action Center", icon: Zap, highlight: false, perm: "project.read" },
    { id: "dashboard" as NavTab, label: "Executive Dashboard", icon: LayoutDashboard, perm: "project.read" },
    { id: "projects" as NavTab, label: "Projects & Health", icon: FolderKanban, perm: "project.read" },
    { id: "tasks" as NavTab, label: "My Work & Tasks", icon: CheckSquare, perm: "task.read" },
    { id: "tickets" as NavTab, label: "Incident Tickets", icon: Ticket, perm: "ticket.read" },
    { id: "approvals" as NavTab, label: "Governance Approvals", icon: ShieldCheck, perm: "approval.read" },
    { id: "risks" as NavTab, label: "Risk Matrix", icon: AlertOctagon, perm: "risk.read" },
    { id: "calendar" as NavTab, label: "Calendar & Schedules", icon: Calendar, perm: "calendar.read" },
    { id: "knowledge" as NavTab, label: "Knowledge & RAG", icon: BookOpen, perm: "knowledge.read" },
  ];

  const visibleNavItems = allNavItems.filter((item) => hasPermission(item.perm));

  const isAcme = currentUser?.organization_id === "11111111-1111-1111-1111-111111111111";

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/80 flex flex-col p-4 shrink-0">
      <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
          PM
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">PM BUDDY</h1>
          <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">AI Operations Platform</p>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : item.highlight
                  ? "text-blue-400 hover:bg-slate-900 border border-blue-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800/80 px-3">
        <p className="text-[10px] font-mono text-slate-400">
          Tenant: <strong className="text-slate-300">{isAcme ? "Acme Corp" : "Globex Inc"}</strong>
        </p>
        <p className="text-[10px] font-mono text-slate-400">
          Role: <strong className="text-slate-300">{currentUser?.role || "PM"}</strong>
        </p>
        <div className="mt-2 text-[9px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
          RBAC Active: {currentUser?.permissions.length || 0} permissions
        </div>
      </div>
    </aside>
  );
}
