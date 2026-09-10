"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Filter,
  LifeBuoy,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { Ticket } from "@/types/api";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";

export function TicketsView() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loadingTicketDetails, setLoadingTicketDetails] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New Ticket Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSeverity, setNewSeverity] = useState("high");
  const [newPriority, setNewPriority] = useState("P1");
  const [newCategory, setNewCategory] = useState("Incident");
  const [newService, setNewService] = useState("api-gateway");
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getTickets();
      setTickets(data || []);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    setActionMessage(null);
    try {
      const created = await api.createTicket({
        title: newTitle.trim(),
        description: newDesc.trim() || `Incident reported: ${newTitle.trim()}`,
        severity: newSeverity,
        priority: newPriority,
        category: newCategory,
        status: "new",
        affected_service: newService.trim() || undefined,
      });

      setTickets((prev) => [created, ...prev]);
      setStatusFilter("NEW");
      setShowCreateModal(false);
      setNewTitle("");
      setNewDesc("");
      toast.success("Ticket Created", `Ticket ${created.ticket_number} created successfully!`);
      setActionMessage({ text: `Ticket ${created.ticket_number} created successfully!`, type: "success" });
    } catch (err: any) {
      toast.error("Failed to Create Ticket", err.message || "Failed to create ticket");
      setActionMessage({ text: err.message || "Failed to create ticket", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await api.updateTicketStatus(ticketId, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      toast.success("Ticket Updated", `Status updated to ${newStatus}`);
      setActionMessage({ text: `Ticket status updated to ${newStatus}`, type: "success" });
    } catch (err: any) {
      toast.error("Update Failed", err.message || "Failed to update ticket");
      setActionMessage({ text: err.message || "Failed to update ticket", type: "error" });
    }
  };

  const handleOpenTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setLoadingTicketDetails(true);
    try {
      const detailed = await api.getTicket(ticket.id);
      setSelectedTicket(detailed);
    } catch (err: any) {
      console.warn("Could not fetch full ticket details, using list data:", err);
    } finally {
      setLoadingTicketDetails(false);
    }
  };

  const isTicketNew = (t: any) => {
    const s = (t.status || "").toLowerCase();
    if (s === "new") return true;
    if (t.created_at) {
      const diffHours = (Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60);
      if (diffHours <= 24 && s === "open") return true;
    }
    return false;
  };

  const filtered = tickets.filter((t) => {
    if (severityFilter !== "ALL" && t.severity !== severityFilter) return false;

    if (statusFilter === "NEW") {
      return isTicketNew(t);
    }
    if (statusFilter === "OPEN") {
      const s = (t.status || "").toLowerCase();
      return s === "open" || s === "new";
    }
    if (statusFilter === "IN_PROGRESS") {
      return (t.status || "").toLowerCase() === "in_progress";
    }
    if (statusFilter === "RESOLVED") {
      const s = (t.status || "").toLowerCase();
      return s === "resolved" || s === "closed";
    }
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

  const newTicketCount = tickets.filter(isTicketNew).length;

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <button
            onClick={loadTickets}
            disabled={loading}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
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

      {/* Filters Bar with "New" Tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl">
        {/* Status Tabs including the requested NEW filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Tickets", count: tickets.length },
            { id: "NEW", label: "✨ New", count: newTicketCount, highlight: true },
            { id: "OPEN", label: "Open", count: tickets.filter((t) => ["open", "new"].includes(t.status?.toLowerCase())).length },
            { id: "IN_PROGRESS", label: "In Progress", count: tickets.filter((t) => t.status?.toLowerCase() === "in_progress").length },
            { id: "RESOLVED", label: "Resolved", count: tickets.filter((t) => ["resolved", "closed"].includes(t.status?.toLowerCase())).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? tab.highlight
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                  : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab.id
                  ? tab.highlight ? "bg-amber-600 text-white" : "bg-blue-700 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Severity Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl self-end sm:self-auto">
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

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Loading tickets from primary database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-8 text-center text-slate-400 text-xs space-y-2">
          <p>No tickets match the selected criteria ({statusFilter} filter).</p>
          {statusFilter === "NEW" && (
            <p className="text-[11px] text-slate-500">
              Click &quot;New Ticket&quot; above to create and track a new incident.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const isBreached = ticket.is_breached || ticket.sla_status === "breached";
            const isWarning = ticket.sla_status === "warning";
            const isNew = isTicketNew(ticket);
            const isResolved = ["resolved", "closed"].includes((ticket.status || "").toLowerCase());

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-2xl border transition ${
                  isBreached
                    ? "bg-rose-950/20 border-rose-800/80 shadow-lg"
                    : isWarning
                    ? "bg-amber-950/20 border-amber-800/60"
                    : isNew
                    ? "bg-amber-950/10 border-amber-500/40 shadow-md"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {ticket.ticket_number}
                    </span>
                    {isNew && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase font-mono shadow">
                        NEW
                      </span>
                    )}
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
                        <Clock className="w-3.5 h-3.5" /> SLA AT RISK ({ticket.breach_risk_score || 75}% Risk)
                      </span>
                    ) : isResolved ? (
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
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

                <h3
                  onClick={() => handleOpenTicketDetails(ticket)}
                  className="text-sm font-semibold text-white mt-3 cursor-pointer hover:text-blue-400 transition"
                >
                  {ticket.title}
                </h3>
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800/80 text-xs">
                  <div className="text-slate-400">
                    SLA Deadline:{" "}
                    <span className="text-slate-200">
                      {ticket.sla_due_at ? new Date(ticket.sla_due_at).toLocaleString() : "None"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenTicketDetails(ticket)}
                      className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded transition text-[11px] font-medium"
                    >
                      View Details
                    </button>

                    {ticket.assignee_id ? (
                      <span className="flex items-center gap-1 text-slate-300 bg-slate-800 px-2 py-1 rounded">
                        <UserCheck className="w-3 h-3 text-indigo-400" /> Assigned
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded">
                        Unassigned
                      </span>
                    )}

                    {/* Quick Interactive Status Action Buttons */}
                    {!isResolved ? (
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, "resolved")}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded transition text-[11px] font-medium"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, "in_progress")}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition text-[11px]"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                Report Incident / New Ticket
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Ticket Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Leak in Redis Connection Worker"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide technical context, symptoms, and impacted endpoints..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="critical">Critical (P0 / SLA Breach Risk)</option>
                    <option value="high">High (P1)</option>
                    <option value="medium">Medium (P2)</option>
                    <option value="low">Low (P3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="P0">P0 - Highest</option>
                    <option value="P1">P1 - Urgent</option>
                    <option value="P2">P2 - Standard</option>
                    <option value="P3">P3 - Routine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Affected Service</label>
                  <input
                    type="text"
                    placeholder="e.g. auth-proxy, payments-api"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
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
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  {selectedTicket.ticket_number}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(
                    selectedTicket.severity
                  )}`}
                >
                  {selectedTicket.severity}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{selectedTicket.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {selectedTicket.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Status</span>
                <p className="font-semibold text-slate-200 mt-0.5 capitalize">{selectedTicket.status}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Priority</span>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedTicket.priority}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Affected Service</span>
                <p className="font-mono text-slate-300 mt-0.5">{selectedTicket.affected_service || "N/A"}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase">SLA Target Due</span>
                <p className="font-mono text-slate-300 mt-0.5">
                  {selectedTicket.sla_due_at ? new Date(selectedTicket.sla_due_at).toLocaleString() : "None"}
                </p>
              </div>
            </div>

            {(selectedTicket.probable_cause || selectedTicket.suggested_resolution) && (
              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-900/40 text-xs space-y-2">
                <span className="font-bold text-indigo-400 font-mono text-[11px] block">AI Root-Cause & Resolution</span>
                {selectedTicket.probable_cause && (
                  <p className="text-slate-300"><span className="text-slate-500">Probable Cause:</span> {selectedTicket.probable_cause}</p>
                )}
                {selectedTicket.suggested_resolution && (
                  <p className="text-slate-300"><span className="text-slate-500">Recommendation:</span> {selectedTicket.suggested_resolution}</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
