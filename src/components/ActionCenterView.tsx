"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { ActionRecommendation, Approval, Ticket, Task } from "@/types/api";

export function ActionCenterView() {
  const [recommendations, setRecommendations] = useState<ActionRecommendation[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadActionCenterData = async () => {
    if (!api.isReady()) return; // Never fire without a bearer token
    try {
      setLoading(true);
      const [recsData, approvalsData, ticketsData, tasksData] = await Promise.all([
        api.getActionRecommendations().catch(() => []),
        api.getApprovals().catch(() => []),
        api.getTickets().catch(() => []),
        api.getTasks({ is_blocked: true }).catch(() => []),
      ]);

      setRecommendations(Array.isArray(recsData) ? recsData : []);
      setApprovals(Array.isArray(approvalsData) ? approvalsData : []);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err: any) {
      console.error("Failed to load action center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Poll until auth token is ready, then load once
    if (api.isReady()) {
      loadActionCenterData();
    } else {
      const wait = setInterval(() => {
        if (api.isReady()) {
          clearInterval(wait);
          loadActionCenterData();
        }
      }, 100);
      return () => clearInterval(wait);
    }
  }, []);

  const handleApproveGate = async (approvalId: string) => {
    try {
      setExecutingId(approvalId);
      setStatusMessage(null);
      // Execute gate approval via PM Buddy chat / HITL
      const chatRes = await api.sendChatMessage(`approve governance gate for approval ID ${approvalId}`);
      
      // If an action confirmation block was returned, confirm it
      const confBlock = chatRes.blocks.find((b) => b.type === "action_confirmation" && b.action_id);
      if (confBlock && confBlock.action_id) {
        await api.confirmAction(confBlock.action_id);
      }

      setStatusMessage({ text: "Governance gate approval dispatched successfully", type: "success" });
      await loadActionCenterData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to approve gate", type: "error" });
    } finally {
      setExecutingId(null);
    }
  };

  const handleExecuteRecommendation = async (rec: ActionRecommendation) => {
    try {
      setExecutingId(rec.id);
      setStatusMessage(null);

      // Trigger recommendation action through PM Buddy AI
      const prompt = `Execute recommended action: ${rec.proposed_action} for entity ${rec.entity_type} ${rec.entity_id}`;
      const chatRes = await api.sendChatMessage(prompt);

      // Check if HITL confirmation needed
      const confBlock = chatRes.blocks.find((b) => b.type === "action_confirmation" && b.action_id);
      if (confBlock && confBlock.action_id) {
        await api.confirmAction(confBlock.action_id);
      }

      setStatusMessage({ text: `Action executed: ${rec.proposed_action}`, type: "success" });
      await loadActionCenterData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to execute action", type: "error" });
    } finally {
      setExecutingId(null);
    }
  };

  const breachedTickets = tickets.filter((t) => t.sla_status === "breached" || t.is_breached);
  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Action Center & Governance Inbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consolidated operational decisions, pending HITL proposals, gate approvals & blocker resolutions
          </p>
        </div>

        <button
          onClick={loadActionCenterData}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-2 rounded-xl text-xs font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Actions</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="opacity-70 hover:opacity-100">
            &times;
          </button>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Action Recommendations</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{recommendations.length}</p>
          <span className="text-[10px] text-amber-400/80 font-mono">Deterministic heuristics</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pending Gate Approvals</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{pendingApprovals.length}</p>
          <span className="text-[10px] text-blue-400/80 font-mono">Stage-gate compliance</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">SLA Breached Tickets</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">{breachedTickets.length}</p>
          <span className="text-[10px] text-rose-400/80 font-mono">P0 / High risk</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Blocked Tasks</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">{tasks.length}</p>
          <span className="text-[10px] text-purple-400/80 font-mono">Dependency stalls</span>
        </div>
      </div>

      {/* Section 1: Recommended Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            AI & Heuristic Recommendations ({recommendations.length})
          </h3>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
            No active operational warnings or recommendations at this moment. System is nominal.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                        rec.severity === "critical"
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                          : rec.severity === "warning"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {rec.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 capitalize">{rec.entity_type}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 mb-1">{rec.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{rec.description}</p>

                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                    <strong className="text-slate-400">Proposed: </strong>
                    {rec.proposed_action}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {rec.hitl_required ? "Requires Human Approval" : "Instant Resolution"}
                  </span>
                  <button
                    onClick={() => handleExecuteRecommendation(rec)}
                    disabled={executingId === rec.id}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition disabled:opacity-50"
                  >
                    <span>{executingId === rec.id ? "Processing..." : "Take Action"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Pending Stage-Gate Approvals */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-3.5 h-3.5 text-blue-400" />
          Pending Governance Approvals ({pendingApprovals.length})
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
            No pending stage-gate approvals requiring sign-off.
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
            {pendingApprovals.map((app) => (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{app.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Stage: {app.stage}
                    </span>
                    {app.is_breached && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Overdue ({app.days_overdue}d)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{app.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveGate(app.id)}
                    disabled={executingId === app.id}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{executingId === app.id ? "Approving..." : "Approve Gate"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Critical SLA Breaches */}
      {breachedTickets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Critical SLA Breaches Requiring Immediate Triage ({breachedTickets.length})
          </h3>

          <div className="bg-slate-900/40 border border-rose-900/30 rounded-2xl divide-y divide-slate-800/80">
            {breachedTickets.map((t) => (
              <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-rose-300 font-mono">[{t.ticket_number}]</span>
                    <span className="text-xs font-medium text-slate-200">{t.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Service: {t.affected_service || "Core API"} | Resolution: {t.suggested_resolution || "Escalation to on-call lead"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleExecuteRecommendation({
                      id: t.id,
                      title: `Escalate ${t.ticket_number}`,
                      description: `Escalate ticket to on-call engineer`,
                      severity: "critical",
                      entity_type: "ticket",
                      entity_id: t.id,
                      proposed_action: `escalate ticket ${t.ticket_number}`,
                      rationale: "SLA breached",
                      hitl_required: true,
                    })
                  }
                  disabled={executingId === t.id}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0"
                >
                  Escalate Incident
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
