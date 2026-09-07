"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, AlertOctagon, CheckCircle2, Clock, Filter, LifeBuoy, ShieldCheck, UserCheck } from "lucide-react";
import { Ticket } from "@/types/api";
import { api } from "@/lib/api";

export function TicketsView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await api.getTickets();
        setTickets(data);
      } catch (err) {
        console.error("Failed to load tickets", err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  const filtered = tickets.filter((t) => {
    if (severityFilter !== "ALL" && t.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "high":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "medium":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-rose-400" />
            Incident & Support Tickets
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time SLA countdowns, automated root cause hints, and assignment recommendation engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              aria-label="Filter tickets by severity"
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Severities</option>
              <option value="critical" className="bg-slate-900">Critical</option>
              <option value="high" className="bg-slate-900">High</option>
              <option value="medium" className="bg-slate-900">Medium</option>
              <option value="low" className="bg-slate-900">Low</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Loading tickets from primary database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-8 text-center text-slate-400 text-xs">
          No tickets match the selected criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const isBreached = ticket.is_breached || ticket.sla_status === "breached";
            const isWarning = ticket.sla_status === "warning";

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-2xl border transition ${
                  isBreached
                    ? "bg-rose-950/20 border-rose-800/80 shadow-lg"
                    : isWarning
                    ? "bg-amber-950/20 border-amber-800/60"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {ticket.ticket_number}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(
                        ticket.severity
                      )}`}
                    >
                      {ticket.severity}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {ticket.priority}
                    </span>
                    {ticket.affected_service && (
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {ticket.affected_service}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {isBreached ? (
                      <span className="flex items-center gap-1 font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 rounded-full">
                        <AlertOctagon className="w-3.5 h-3.5" /> SLA BREACHED
                      </span>
                    ) : isWarning ? (
                      <span className="flex items-center gap-1 font-semibold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> SLA AT RISK ({ticket.breach_risk_score}% Risk)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" /> SLA Healthy
                      </span>
                    )}
                    <span className="text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mt-3">{ticket.title}</h3>
                {ticket.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ticket.description}</p>
                )}

                {/* Probable Cause & Resolution Recommendation */}
                {(ticket.probable_cause || ticket.suggested_resolution) && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                    {ticket.probable_cause && (
                      <div className="flex items-start gap-2 text-slate-300">
                        <span className="font-semibold text-indigo-400 shrink-0">Probable Cause:</span>
                        <span>{ticket.probable_cause}</span>
                      </div>
                    )}
                    {ticket.suggested_resolution && (
                      <div className="flex items-start gap-2 text-slate-300">
                        <span className="font-semibold text-emerald-400 shrink-0">Resolution Hint:</span>
                        <span>{ticket.suggested_resolution}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
                  <div className="text-slate-400">
                    SLA Deadline:{" "}
                    <span className="text-slate-200">
                      {ticket.sla_due_at ? new Date(ticket.sla_due_at).toLocaleString() : "None"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ticket.assignee_id ? (
                      <span className="flex items-center gap-1 text-slate-300 bg-slate-800 px-2 py-1 rounded">
                        <UserCheck className="w-3 h-3 text-indigo-400" /> Assigned
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
