"use client";

import React, { useEffect, useState } from "react";
import { AlertOctagon, CheckCircle2, Clock, ShieldAlert, XCircle, Lock } from "lucide-react";
import { Approval } from "@/types/api";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function ApprovalsView() {
  const { hasPermission } = useAuth();
  const canApprove = hasPermission("approval.approve");
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getApprovals();
        setApprovals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-400 font-mono">Loading approvals...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-white">Governance Gates & Approvals</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Track stage-gate decisions, monitor SLA limits, and unblock stalled project streams.
        </p>
      </div>

      <div className="space-y-3">
        {approvals.map((app) => (
          <div
            key={app.id}
            className={`p-5 rounded-2xl border ${
              app.is_breached
                ? "bg-rose-950/20 border-rose-800/80 shadow-lg"
                : "bg-slate-900/60 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-300">
                  {app.stage.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">Project: {app.project_name}</span>
              </div>

              {app.is_breached ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40 px-3 py-1 rounded-full">
                  <AlertOctagon className="w-3.5 h-3.5" /> SLA BREACHED ({app.days_overdue} days overdue)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" /> Active Review Gate
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-white mt-3">{app.title}</h3>
            {app.description && <p className="text-xs text-slate-400 mt-1">{app.description}</p>}

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                SLA Deadline: <span className="text-slate-200">{new Date(app.sla_due_at).toLocaleString()}</span>
              </p>

              {canApprove ? (
                <div className="flex gap-2">
                  <button className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Gate
                  </button>
                  <button className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 text-xs font-medium transition">
                    Reject
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Approval Locked (No Permission)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
