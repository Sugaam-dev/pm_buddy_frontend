"use client";

import React, { useEffect, useState } from "react";
import { AlertOctagon, CheckCircle2, Clock, ShieldAlert, XCircle, Lock, RefreshCw, X } from "lucide-react";
import { Approval } from "@/types/api";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function ApprovalsView() {
  const { hasPermission } = useAuth();
  const canApprove = hasPermission("approval.approve");
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await api.getApprovals();
      setApprovals(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleDecide = async (approvalId: string, decision: "approved" | "rejected") => {
    if (!canApprove) return;
    setProcessingId(approvalId);
    setStatusMessage(null);
    try {
      await api.decideApproval(approvalId, decision);
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
      setStatusMessage({
        text: `Stage gate ${decision === "approved" ? "Approved" : "Rejected"} successfully.`,
        type: "success",
      });
    } catch (err: any) {
      setStatusMessage({
        text: err.message || `Failed to ${decision} gate.`,
        type: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-400 font-mono p-8 text-center">Loading approvals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Governance Gates & Approvals</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track stage-gate decisions, monitor SLA limits, and unblock stalled project streams.
          </p>
        </div>

        <button
          onClick={loadApprovals}
          disabled={loading}
          className="self-start sm:self-auto p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition"
          title="Refresh approvals"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {approvals.length === 0 ? (
        <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-10 text-center text-slate-400 text-xs space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="font-semibold text-slate-200">No Pending Stage Gates</p>
          <p className="text-slate-500">All governance gates and architecture reviews are fully signed off.</p>
        </div>
      ) : (
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-800/80">
                <p className="text-xs text-slate-400">
                  SLA Deadline: <span className="text-slate-200">{new Date(app.sla_due_at).toLocaleString()}</span>
                </p>

                {canApprove ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecide(app.id, "approved")}
                      disabled={processingId === app.id}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{processingId === app.id ? "Approving..." : "Approve Gate"}</span>
                    </button>
                    <button
                      onClick={() => handleDecide(app.id, "rejected")}
                      disabled={processingId === app.id}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 text-xs font-medium transition disabled:opacity-50"
                    >
                      <span>{processingId === app.id ? "Rejecting..." : "Reject"}</span>
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
      )}
    </div>
  );
}
