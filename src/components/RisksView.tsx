"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Risk } from "@/types/api";
import { api } from "@/lib/api";

export function RisksView() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRisks() {
      try {
        const data = await api.getRisks();
        setRisks(data);
      } catch (err) {
        console.error("Failed to load risks", err);
      } finally {
        setLoading(false);
      }
    }
    loadRisks();
  }, []);

  const getScoreBadge = (score: number) => {
    if (score >= 20) return "bg-rose-500/20 text-rose-400 border-rose-500/40";
    if (score >= 12) return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    if (score >= 6) return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Portfolio Risk Exposure Matrix
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Deterministic 5x5 Likelihood x Impact scoring with proactive mitigation playbooks.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Loading risks from primary database...
        </div>
      ) : risks.length === 0 ? (
        <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-8 text-center text-slate-400 text-xs">
          No risks logged in the portfolio.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks.map((risk) => {
            const score = risk.score || risk.likelihood * risk.impact;

            return (
              <div
                key={risk.id}
                className="p-5 rounded-2xl border bg-slate-900/60 border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {risk.category}
                    </span>
                    <span className="text-xs text-slate-400">Project: {risk.project_name || "Portfolio"}</span>
                  </div>

                  <span
                    className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${getScoreBadge(
                      score
                    )}`}
                  >
                    Score: {score} ({risk.likelihood}x{risk.impact})
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white">{risk.title}</h3>
                {risk.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">{risk.description}</p>
                )}

                {risk.mitigation_plan && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-emerald-300">Mitigation Strategy:</span>
                        <p className="text-slate-300 leading-relaxed">{risk.mitigation_plan}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span className="capitalize">Status: {risk.status}</span>
                  <span>Impact: {risk.impact}/5 | Likelihood: {risk.likelihood}/5</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
