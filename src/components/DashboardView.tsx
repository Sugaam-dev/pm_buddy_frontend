"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  ShieldCheck,
  Calendar,
  Sparkles,
  Zap,
  Users,
  Building2,
  TrendingUp,
  FileText,
  Lock,
  ListTodo,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Approval, Project, Risk, Task, Ticket } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface DashboardViewProps {
  onNavigate?: (tab: string) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const router = useRouter();
  const { currentUser, hasPermission, hasRole } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigateTo = (routeOrTab: string) => {
    if (onNavigate) {
      onNavigate(routeOrTab);
    }
    // Also support direct route navigation
    const routeMap: Record<string, string> = {
      projects: "/app/projects",
      tasks: "/app/tasks",
      tickets: "/app/tickets",
      approvals: "/app/approvals",
      risks: "/app/risks",
      calendar: "/app/calendar",
      knowledge: "/app/knowledge",
      action_center: "/app/actions",
      ai: "/app/ai",
    };
    if (routeMap[routeOrTab]) {
      router.push(routeMap[routeOrTab]);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [p, a, t, tk, r, m, rec, b] = await Promise.all([
          api.getProjects().catch(() => []),
          api.getApprovals().catch(() => []),
          api.getTasks().catch(() => []),
          api.getTickets().catch(() => []),
          api.getRisks().catch(() => []),
          api.getCalendarEvents().catch(() => []),
          api.getActionRecommendations().catch(() => []),
          api.getDailyBriefing().catch(() => null),
        ]);
        setProjects(p || []);
        setApprovals(a || []);
        setTasks(t || []);
        setTickets(tk || []);
        setRisks(r || []);
        setMeetings(m || []);
        setRecommendations(rec || []);
        setBriefing(b);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser?.organization_id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-sm text-slate-400 font-mono space-y-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 animate-spin">
          <Layers className="w-4 h-4" />
        </div>
        <span>Loading real-time operational telemetry for {currentUser?.role || "user"}...</span>
      </div>
    );
  }

  const role = (currentUser?.role || "VIEWER").toLowerCase();
  const isViewer = role === "viewer";
  const isAdmin = role === "admin";
  const isPM = role === "pm" || role === "project_manager";
  const isCTO = role === "cto";
  const isLead = role === "team_lead";
  const isEngineer = role === "engineer";

  const atRiskCount = projects.filter((p) => p.health === "at_risk" || p.health === "caution").length;
  const breachedApprovals = approvals.filter((a) => (a as any).is_breached || a.status === "pending");
  const p0Tasks = tasks.filter((t) => t.priority === "P0");
  const p1Tasks = tasks.filter((t) => t.priority === "P1");
  const blockedTasks = tasks.filter((t) => t.is_blocked);
  const criticalTickets = tickets.filter((tk) => tk.severity === "critical");
  const highRisks = risks.filter((r) => (r.likelihood || 1) * (r.impact || 1) >= 15);

  // Engineer specific filtering: my tasks
  const myTasks = tasks.filter(
    (t) => t.assignee_id === currentUser?.user_id || currentUser?.role === "ENGINEER"
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Role Indicator Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              {currentUser?.role || "VIEWER"} Persona Active
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Tenant: {currentUser?.organization_id === "11111111-1111-1111-1111-111111111111" ? "Acme Corp" : "Globex Inc"}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
            {isAdmin && "Enterprise Organization & Telemetry Hub"}
            {isPM && "Project Delivery & Operational Cockpit"}
            {isCTO && "Executive Technology & Risk Portfolio"}
            {isLead && "Team Execution & Engineering Queue"}
            {isEngineer && "My Active Work & Engineering Priorities"}
            {isViewer && "Operational Portfolio Overview (Read-Only)"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin && "System-wide governance, tenant isolation metrics, SLA monitoring, and organization overview."}
            {isPM && "Tracking milestone delivery, blocker resolution, gate approvals, and team calendar alignment."}
            {isCTO && "High-level risk distribution, governance bottlenecks, architecture sign-offs, and budget health."}
            {isLead && "Workload distribution, critical incident triage, active blockers, and daily team syncs."}
            {isEngineer && "Assigned tasks, incident tickets, blocker alerts, and scheduled architectural syncs."}
            {isViewer && "High-level view of project statuses, risk matrices, and calendar milestones. Mutation disabled."}
          </p>
        </div>

        {/* Action Button for non-viewers */}
        {!isViewer && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigateTo("ai")}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask PM Buddy AI</span>
            </button>
          </div>
        )}
      </div>

      {/* Top Banner if breaches exist */}
      {breachedApprovals.length > 0 && (
        <div className="border border-rose-800/80 bg-rose-950/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400">
              <AlertOctagon className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                SLA Breach Detected: {breachedApprovals.length} Governance Gate(s) Pending
              </p>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Cloud Infrastructure Budget Approval is approaching or past the SLA deadline.
              </p>
            </div>
          </div>
          {!isViewer && (
            <button
              onClick={() => navigateTo("approvals")}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition"
            >
              Review Gates
            </button>
          )}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Portfolio Status"
          value={atRiskCount > 0 ? `${atRiskCount} AT RISK` : "HEALTHY"}
          sub={`${projects.length} Total Projects monitored`}
          variant={atRiskCount > 0 ? "danger" : "success"}
          icon={Layers}
        />
        <MetricCard
          title="SLA Breaches & Risks"
          value={breachedApprovals.length.toString()}
          sub="Governance gates & tickets"
          variant={breachedApprovals.length > 0 ? "danger" : "normal"}
          icon={Clock}
        />
        <MetricCard
          title="P0 Critical Tasks"
          value={p0Tasks.length.toString()}
          sub={`${blockedTasks.length} blocked on dependencies`}
          variant={p0Tasks.length > 0 ? "warning" : "normal"}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Active Incidents"
          value={criticalTickets.length.toString()}
          sub="Platform and critical severity"
          variant={criticalTickets.length > 0 ? "danger" : "normal"}
          icon={AlertTriangle}
        />
      </div>

      {/* ========================================================================= */}
      {/* ROLE SPECIFIC SECTION 1: ADMIN & CTO EXECUTIVE VIEW                     */}
      {/* ========================================================================= */}
      {(isAdmin || isCTO) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organization & Tenant Meta (Admin) */}
          {isAdmin && (
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>Tenant Administration</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Enterprise Tier
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Organization ID:</span>
                  <span className="font-mono text-slate-200">11111111-1111...</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">SLA Strict Mode:</span>
                  <span className="text-emerald-400 font-medium">Enforced</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">RBAC Active Policies:</span>
                  <span className="font-mono text-slate-200">6 Roles / 14 Permissions</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Auditing:</span>
                  <span className="text-blue-400 font-medium">Immutable SHA256 Log</span>
                </div>
              </div>
            </div>
          )}

          {/* CTO Portfolio Health & Risk Distribution */}
          {isCTO && (
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Portfolio Risk Breakdown</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Executive</span>
              </div>
              <div className="space-y-3">
                {projects.slice(0, 3).map((proj) => (
                  <div key={proj.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-200">{proj.name}</span>
                      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                        proj.health === "healthy"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}>
                        {proj.health}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Budget: {formatCurrency(proj.budget)}</span>
                      <span>Spent: {formatCurrency(proj.spent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* High Priority Risks */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Critical Risks Matrix</span>
              </div>
              <button
                onClick={() => navigateTo("risks")}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                View all &rarr;
              </button>
            </div>
            <div className="space-y-2.5">
              {risks.slice(0, 3).map((risk) => (
                <div key={risk.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-slate-200">{risk.title}</span>
                    <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">
                      Score {(risk.likelihood || 1) * (risk.impact || 1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{risk.mitigation_plan || "Plan in progress"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Approvals Backlog */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Governance Stage Gates</span>
              </div>
              <button
                onClick={() => navigateTo("approvals")}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Review &rarr;
              </button>
            </div>
            <div className="space-y-2.5">
              {approvals.slice(0, 3).map((appr) => (
                <div key={appr.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-slate-200">{appr.title}</span>
                    <span className="text-[10px] uppercase font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      {appr.stage}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Status: {appr.status}</span>
                    <span className="text-rose-400 font-mono">SLA: In Decisive Window</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE SPECIFIC SECTION 2: PM & TEAM LEAD OPERATIONAL COCKPIT              */}
      {/* ========================================================================= */}
      {(isPM || isLead) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Blockers & P0 Work */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>High-Priority Tasks & Blocker Radar</span>
              </div>
              <button
                onClick={() => navigateTo("tasks")}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Manage Tasks &rarr;
              </button>
            </div>
            <div className="space-y-2">
              {p0Tasks.concat(p1Tasks).slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{task.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        task.priority === "P0" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>
                        {task.priority}
                      </span>
                      {task.is_blocked && (
                        <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">
                          BLOCKED
                        </span>
                      )}
                    </div>
                    {task.blocker_reason && (
                      <p className="text-[11px] text-rose-300/80 italic">Reason: {task.blocker_reason}</p>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Score: {task.priority_score || 80}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Meetings & Coordination */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Today&apos;s Engineering Syncs</span>
              </div>
              <button
                onClick={() => navigateTo("calendar")}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Calendar &rarr;
              </button>
            </div>
            <div className="space-y-2.5">
              {meetings.slice(0, 3).map((event: any, i: number) => (
                <div key={event.id || i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-medium text-slate-200">{event.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{new Date(event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>·</span>
                    <span>{event.attendees?.length || 2} attendees</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE SPECIFIC SECTION 3: ENGINEER WORKSPACE                              */}
      {/* ========================================================================= */}
      {isEngineer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Tasks List */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <ListTodo className="w-4 h-4 text-emerald-400" />
                <span>My Assigned Work Items</span>
              </div>
              <button
                onClick={() => navigateTo("tasks")}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                View full list &rarr;
              </button>
            </div>
            <div className="space-y-2">
              {myTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{task.title}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{task.description || "No description"}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Knowledge & AI Recommendations */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Knowledge & Context Shortcuts</span>
              </div>
              <button
                onClick={() => navigateTo("knowledge")}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Explore &rarr;
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                <p className="font-semibold text-slate-200 text-[11px]">Payment Gateway Architecture v2.1</p>
                <p className="text-[10px] text-slate-400 mt-0.5">SSL handshake mitigation & failover guides.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                <p className="font-semibold text-slate-200 text-[11px]">Kubernetes Staging Deployment Runbook</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Helm chart manifest verification checklist.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE SPECIFIC SECTION 4: VIEWER READ-ONLY DASHBOARD                      */}
      {/* ========================================================================= */}
      {isViewer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Project Health Status (Read-Only)</span>
            </div>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">{proj.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Key: {proj.key}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                    proj.health === "healthy" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}>
                    {proj.health}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Upcoming Milestones & Calendar</span>
            </div>
            <div className="space-y-3">
              {meetings.slice(0, 4).map((m: any, i: number) => (
                <div key={m.id || i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-medium text-slate-200">{m.title}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {new Date(m.start_time).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations Bar */}
      {recommendations.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-blue-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Operational Next-Action Recommendations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-slate-200 text-[11px] block">{rec.title || rec.action}</span>
                <p className="text-[10px] text-slate-400 line-clamp-2">{rec.description || rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  variant,
  icon: Icon,
}: {
  title: string;
  value: string;
  sub: string;
  variant: "normal" | "danger" | "warning" | "success";
  icon: any;
}) {
  const getColors = () => {
    switch (variant) {
      case "danger":
        return "border-rose-800/60 bg-rose-950/10 text-rose-400";
      case "warning":
        return "border-amber-800/60 bg-amber-950/10 text-amber-400";
      case "success":
        return "border-emerald-800/60 bg-emerald-950/10 text-emerald-400";
      default:
        return "border-slate-800 bg-slate-900/60 text-blue-400";
    }
  };

  return (
    <div className={`p-5 rounded-2xl border ${getColors()} transition shadow-lg`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{title}</span>
        <Icon className="w-4 h-4 opacity-80" />
      </div>
      <div className="text-2xl font-bold text-white mt-2 tracking-tight">{value}</div>
      <div className="text-[11px] text-slate-400 mt-1 font-mono">{sub}</div>
    </div>
  );
}
