"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, DollarSign, FolderKanban, ShieldCheck } from "lucide-react";
import { Project } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProjects();
        setProjects(data);
        if (data.length > 0) {
          const dash = await api.getProjectDashboard(data[0].id);
          setSelectedDashboard(dash);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectProject = async (id: string) => {
    try {
      const dash = await api.getProjectDashboard(id);
      setSelectedDashboard(dash);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-400 font-mono">Loading projects...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Projects List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Portfolio Projects</h3>
        {projects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => handleSelectProject(proj.id)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              selectedDashboard?.project?.id === proj.id
                ? "bg-slate-800 border-blue-500 shadow-md"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                {proj.key}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  proj.health === "at_risk"
                    ? "border-rose-500 text-rose-400 bg-rose-500/10"
                    : proj.health === "caution"
                    ? "border-amber-500 text-amber-400 bg-amber-500/10"
                    : "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                }`}
              >
                {proj.health.replace("_", " ")}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white mt-2">{proj.name}</h4>
            <p className="text-xs text-slate-400 line-clamp-1 mt-1">{proj.description}</p>
          </div>
        ))}
      </div>

      {/* Selected Project Dashboard Drilldown */}
      <div className="lg:col-span-2">
        {selectedDashboard ? (
          <div className="border border-slate-800 bg-slate-900/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-400">{selectedDashboard.project.key}</span>
                <h2 className="text-lg font-bold text-white">{selectedDashboard.project.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Budget Consumption</p>
                <p className="text-sm font-bold text-slate-200">
                  {formatCurrency(selectedDashboard.project.spent)} / {formatCurrency(selectedDashboard.project.budget)}
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">Progress</p>
                <p className="text-xl font-bold text-blue-400 mt-1">
                  {selectedDashboard.metrics.progress_percentage}%
                </p>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">Blockers</p>
                <p className="text-xl font-bold text-rose-400 mt-1">
                  {selectedDashboard.metrics.blocked_task_count}
                </p>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">Overdue Tasks</p>
                <p className="text-xl font-bold text-amber-400 mt-1">
                  {selectedDashboard.metrics.overdue_tasks}
                </p>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">Critical Tickets</p>
                <p className="text-xl font-bold text-rose-400 mt-1">
                  {selectedDashboard.metrics.critical_ticket_count}
                </p>
              </div>
            </div>

            {/* Blockers & Approvals */}
            {selectedDashboard.blockers.length > 0 && (
              <div className="border border-rose-900/50 bg-rose-950/20 rounded-xl p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Active Delivery Blockers
                </h4>
                <div className="space-y-2">
                  {selectedDashboard.blockers.map((b: any) => (
                    <div key={b.id} className="text-xs text-slate-200">
                      <strong>{b.title}</strong>: <span className="text-rose-300">{b.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            Select a project to inspect dashboard metrics.
          </div>
        )}
      </div>
    </div>
  );
}
