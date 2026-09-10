"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  ListTodo,
  Plus,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react";
import { Task } from "@/types/api";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";

export function TasksView() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterBlocked, setFilterBlocked] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New Task Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("P1");
  const [newDueDate, setNewDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    setActionMessage(null);
    try {
      const created = await api.createTask({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        priority: newPriority,
        status: "todo",
        due_date: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      });

      setTasks((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewDueDate("");
      toast.success("Task Created", `Task "${created.title}" created successfully!`);
      setActionMessage({ text: `Task "${created.title}" created successfully!`, type: "success" });
    } catch (err: any) {
      toast.error("Failed to Create Task", err.message || "Failed to create task");
      setActionMessage({ text: err.message || "Failed to create task", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "done" ? "todo" : "done";
    try {
      await api.updateTaskStatus(taskId, nextStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
      toast.success("Task Updated", `Task marked as ${nextStatus === "done" ? "Completed" : "To Do"}`);
      setActionMessage({
        text: `Task marked as ${nextStatus === "done" ? "Completed" : "To Do"}`,
        type: "success",
      });
    } catch (err: any) {
      toast.error("Update Failed", err.message || "Failed to update task");
      setActionMessage({ text: err.message || "Failed to update task", type: "error" });
    }
  };

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
      {/* Header */}
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
          <button
            onClick={loadTasks}
            disabled={loading}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition"
            title="Refresh tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Tasks" },
            { id: "P0", label: "🔥 P0 Critical" },
            { id: "P1", label: "⚡ P1 High" },
            { id: "P2", label: "P2 Medium" },
            { id: "P3", label: "P3 Low" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPriority(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                filterPriority === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
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
            const isDone = task.status === "done";

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition ${
                  isDone
                    ? "bg-slate-950/40 border-slate-800/60 opacity-70"
                    : task.is_blocked
                    ? "bg-amber-950/20 border-amber-900/60"
                    : task.priority === "P0"
                    ? "bg-slate-900/90 border-rose-900/50 shadow-md"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isDone
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "border-slate-700 hover:border-indigo-500 bg-slate-950"
                      }`}
                      title={isDone ? "Mark as To Do" : "Mark as Completed"}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </button>

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
                      <span className="text-slate-400 font-mono text-[11px]">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className={`text-sm font-semibold mt-2.5 ${isDone ? "line-through text-slate-500" : "text-white"}`}>
                  {task.title}
                </h3>
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

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Create Operational Task
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit JWT Validation Leeway Configuration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task breakdown, acceptance criteria, and technical deliverables..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="P0">P0 - Critical (Blocker / Emergency)</option>
                    <option value="P1">P1 - High (Major Milestone)</option>
                    <option value="P2">P2 - Medium (Standard Sprint Item)</option>
                    <option value="P3">P3 - Low (Housekeeping / Nice to have)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Target Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
