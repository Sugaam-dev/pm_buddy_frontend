"use client";

import React, { useEffect, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Approval, Project, Task, Ticket } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";

export function DashboardView({ onNavigate }: { onNavigate?: (tab: any) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, a, t, tk, m] = await Promise.all([
          api.getProjects(),
          api.getApprovals(),
          api.getTasks(),
          api.getTickets(),
          api.getCalendarEvents().catch(() => []),
        ]);
        setProjects(p);
        setApprovals(a);
        setTasks(t);
        setTickets(tk);
        setMeetings(m);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400 font-mono">
        Loading real-time operational governance telemetry...
      </div>
    );
  }

  const atRiskCount = projects.filter((p) => p.health === "at_risk").length;
  const breachedApprovals = approvals.filter((a) => a.is_breached);
  const p0Tasks = tasks.filter((t) => t.priority === "P0");
  const criticalTickets = tickets.filter((tk) => tk.severity === "critical");

  return (
    <div className="space-y-6">
      {/* Top Banner if breaches exist */}
      {breachedApprovals.length > 0 && (
        <div className="border border-rose-800/80 bg-rose-950/20 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                SLA Breach Detected: {breachedApprovals.length} Governance Gate(s) Overdue
              </p>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Cloud Infrastructure Budget Approval for Project Alpha is overdue by 4 days.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate("approvals")}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition"
          >
            Review Gate
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Portfolio Status"
          value={atRiskCount > 0 ? "AT RISK" : "HEALTHY"}
          sub={`${atRiskCount} of ${projects.length} projects flagged`}
          variant={atRiskCount > 0 ? "danger" : "success"}
          icon={Layers}
        />
        <MetricCard
          title="SLA Breaches"
          value={breachedApprovals.length.toString()}
          sub="Requires immediate PMO escalation"
          variant={breachedApprovals.length > 0 ? "danger" : "normal"}
          icon={Clock}
        />
        <MetricCard
          title="P0 Critical Tasks"
          value={p0Tasks.length.toString()}
          sub={`${tasks.filter((t) => t.is_blocked).length} blocked on dependencies`}
          variant={p0Tasks.length > 0 ? "warning" : "normal"}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Critical Incidents"
          value={criticalTickets.length.toString()}
          sub="Platform auth & API gateways"
          variant={criticalTickets.length > 0 ? "danger" : "normal"}
          icon={AlertTriangle}
        />
      </div>

      {/* Projects Snapshot & Approvals Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Delivery Health */}
        <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Portfolio Delivery Health</h3>
            <button
              onClick={() => onNavigate && onNavigate("projects")}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {proj.key}
                    </span>
                    <p className="text-sm font-medium text-slate-100">{proj.name}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Spent: {formatCurrency(proj.spent)} of {formatCurrency(proj.budget)}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                    proj.health === "at_risk"
                      ? "border-rose-500 bg-rose-500/10 text-rose-400"
                      : proj.health === "caution"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {proj.health.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Approvals */}
        <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Pending Governance Gates</h3>
            <button
              onClick={() => onNavigate && onNavigate("approvals")}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Review All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {approvals.map((app) => (
              <div
                key={app.id}
                className={`p-3.5 rounded-xl border ${
                  app.is_breached
                    ? "bg-rose-950/20 border-rose-800/60"
                    : "bg-slate-950/70 border-slate-800/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{app.title}</span>
                  {app.is_breached ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                      BREACHED ({app.days_overdue}d)
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400">On Track</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Project: {app.project_name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Operational Reviews & Meetings */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-5 shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Upcoming Reviews & Calendar Schedule</h3>
          </div>
          <button
            onClick={() => onNavigate && onNavigate("calendar")}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            Open Full Calendar <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {meetings.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No meetings scheduled for this week.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {meetings.slice(0, 3).map((m: any) => (
              <div
                key={m.id}
                onClick={() => onNavigate && onNavigate("calendar")}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-indigo-500/50 cursor-pointer transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">{m.title}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {m.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                  <span>{new Date(m.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span>
                    {new Date(m.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {m.attendees?.join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  variant = "normal",
  icon: Icon,
}: {
  title: string;
  value: string;
  sub: string;
  variant?: "normal" | "danger" | "warning" | "success";
  icon: any;
}) {
  const styles = {
    normal: "text-white",
    danger: "text-rose-400",
    warning: "text-amber-400",
    success: "text-emerald-400",
  };

  return (
    <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-5 shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <p className={`text-2xl font-bold mt-2 ${styles[variant]}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
