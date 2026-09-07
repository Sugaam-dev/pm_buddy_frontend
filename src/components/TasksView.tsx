"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Clock, Filter, ListTodo, ShieldAlert } from "lucide-react";
import { Task } from "@/types/api";
import { api } from "@/lib/api";

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterBlocked, setFilterBlocked] = useState<string>("ALL");

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await api.getTasks();
        setTasks(data);
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filterPriority !== "ALL" && task.priority !== filterPriority) return false;
    if (filterBlocked === "BLOCKED" && !task.is_blocked) return false;
    if (filterBlocked === "UNBLOCKED" && task.is_blocked) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "P1":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "P2":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      default:
        return "bg-slate-700/40 text-slate-400 border-slate-700";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "in_progress":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-indigo-400" />
            Operational Tasks & Work Breakdown
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked deterministically by PM Buddy Priority Engine (Severity, Blast Radius, SLA Decay, Customer Impact).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              aria-label="Filter tasks by priority"
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Priorities</option>
              <option value="P0" className="bg-slate-900">P0 - Critical</option>
              <option value="P1" className="bg-slate-900">P1 - High</option>
              <option value="P2" className="bg-slate-900">P2 - Medium</option>
              <option value="P3" className="bg-slate-900">P3 - Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <select
              value={filterBlocked}
              onChange={(e) => setFilterBlocked(e.target.value)}
              aria-label="Filter tasks by blocked status"
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Flow</option>
              <option value="BLOCKED" className="bg-slate-900">Blocked Only</option>
              <option value="UNBLOCKED" className="bg-slate-900">Unblocked Only</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Loading tasks from primary database...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-8 text-center text-slate-400 text-xs">
          No tasks match the active filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition ${
                  task.is_blocked
                    ? "bg-amber-950/20 border-amber-900/60"
                    : task.priority === "P0"
                    ? "bg-slate-900/90 border-rose-900/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Score: {task.priority_score || 0}</span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {task.is_blocked && (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" /> BLOCKED
                      </span>
                    )}
                    {isOverdue && (
                      <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" /> OVERDUE
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-slate-400">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mt-2.5">{task.title}</h3>
                {task.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>
                )}

                {task.is_blocked && task.blocker_reason && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">Blocker: </span>
                      {task.blocker_reason}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
