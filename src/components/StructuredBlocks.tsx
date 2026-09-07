"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Users,
} from "lucide-react";
import { ActionProposal, Approval, CalendarSlot, Project, StructuredBlock, Task, Ticket } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";

interface StructuredBlockProps {
  block: StructuredBlock;
  onActionTrigger?: (action: string) => void;
  onConfirmed?: () => void;
}

export function StructuredBlocksRenderer({
  blocks,
  onActionTrigger,
  onConfirmed,
}: {
  blocks: StructuredBlock[];
  onActionTrigger?: (action: string) => void;
  onConfirmed?: () => void;
}) {
  return (
    <div className="space-y-4 my-3">
      {blocks.map((block, idx) => (
        <BlockItem
          key={idx}
          block={block}
          onActionTrigger={onActionTrigger}
          onConfirmed={onConfirmed}
        />
      ))}
    </div>
  );
}

function BlockItem({
  block,
  onActionTrigger,
  onConfirmed,
}: {
  block: StructuredBlock;
  onActionTrigger?: (action: string) => void;
  onConfirmed?: () => void;
}) {
  switch (block.type) {
    case "project_card":
      return <ProjectCardBlock data={block.data} />;
    case "task_list":
      return <TaskListBlock title={block.title} data={block.data} />;
    case "approval_list":
      return <ApprovalListBlock title={block.title} data={block.data} />;
    case "ticket_list":
      return <TicketListBlock title={block.title} data={block.data} />;
    case "calendar_slots":
      return <CalendarSlotsBlock title={block.title} slots={block.slots || []} onSelect={onActionTrigger} />;
    case "action_confirmation":
      return <ActionConfirmationBlock block={block} onConfirmed={onConfirmed} />;
    case "recommendation":
      return <RecommendationBlock title={block.title} items={block.items || []} onTrigger={onActionTrigger} />;
    default:
      return null;
  }
}

// 1. Project Card Block
function ProjectCardBlock({ data }: { data: Project }) {
  const healthColors = {
    healthy: "border-emerald-500 bg-emerald-500/10 text-emerald-400",
    caution: "border-amber-500 bg-amber-500/10 text-amber-400",
    at_risk: "border-rose-500 bg-rose-500/10 text-rose-400",
  };

  return (
    <div className="border border-slate-800 bg-slate-900/90 rounded-xl p-5 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
            {data.key}
          </span>
          <h3 className="text-lg font-semibold text-white mt-2">{data.name}</h3>
        </div>
        <span
          className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${healthColors[data.health] || healthColors.caution}`}
        >
          {data.health.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800/80">
        <div>
          <p className="text-xs text-slate-400">Budget Spent</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">
            {formatCurrency(data.spent)} / {formatCurrency(data.budget)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Target Launch</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">
            {data.target_date ? new Date(data.target_date).toLocaleDateString() : "TBD"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Status</p>
          <p className="text-sm font-semibold capitalize text-slate-200 mt-0.5">{data.status}</p>
        </div>
      </div>
    </div>
  );
}

// 2. Task List Block
function TaskListBlock({ title, data }: { title?: string; data: Task[] }) {
  return (
    <div className="border border-slate-800 bg-slate-900/90 rounded-xl p-4 shadow">
      {title && <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{title}</h4>}
      <div className="space-y-2.5">
        {data.map((task) => (
          <div
            key={task.id}
            className="flex items-start justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-800"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    task.priority === "P0"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {task.priority} ({task.priority_score})
                </span>
                <span className="text-sm font-medium text-slate-100">{task.title}</span>
              </div>
              {task.is_blocked && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{task.blocker_reason}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-slate-400 capitalize">{task.status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Approval List Block
function ApprovalListBlock({ title, data }: { title?: string; data: Approval[] }) {
  return (
    <div className="border border-slate-800 bg-slate-900/90 rounded-xl p-4 shadow">
      {title && <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{title}</h4>}
      <div className="space-y-2.5">
        {data.map((app) => (
          <div
            key={app.id}
            className={`p-3.5 rounded-lg border ${
              app.is_breached
                ? "bg-rose-950/20 border-rose-800/60"
                : "bg-slate-800/60 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">{app.stage.toUpperCase()}</span>
              {app.is_breached ? (
                <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3 h-3" /> SLA BREACHED ({app.days_overdue}d)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Clock className="w-3 h-3" /> Within SLA
                </span>
              )}
            </div>
            <h5 className="text-sm font-semibold text-white mt-1.5">{app.title}</h5>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Ticket List Block
function TicketListBlock({ title, data }: { title?: string; data: Ticket[] }) {
  return (
    <div className="border border-slate-800 bg-slate-900/90 rounded-xl p-4 shadow">
      {title && <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{title}</h4>}
      <div className="space-y-2">
        {data.map((ticket) => (
          <div key={ticket.id} className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-blue-400 font-medium">{ticket.ticket_number}</span>
              <span className="capitalize text-slate-400">{ticket.severity}</span>
            </div>
            <p className="text-sm font-medium text-slate-100 mt-1">{ticket.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. Calendar Slots Block
function CalendarSlotsBlock({
  title,
  slots,
  onSelect,
}: {
  title?: string;
  slots: CalendarSlot[];
  onSelect?: (action: string) => void;
}) {
  return (
    <div className="border border-slate-800 bg-slate-900/90 rounded-xl p-4 shadow">
      {title && <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{title}</h4>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {slots.map((slot, idx) => (
          <button
            key={idx}
            onClick={() => onSelect && onSelect(`Schedule for ${slot.label}`)}
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-sm font-medium text-slate-200 transition"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 6. Action Confirmation Block (HITL Gate)
function ActionConfirmationBlock({
  block,
  onConfirmed,
}: {
  block: StructuredBlock;
  onConfirmed?: () => void;
}) {
  const [status, setStatus] = useState<"pending" | "executing" | "completed" | "error" | "expired" | "dismissed">("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!block.action_id) return;
    setStatus("executing");
    setErrorMessage(null);
    try {
      await api.confirmAction(block.action_id);
      setStatus("completed");
      if (onConfirmed) onConfirmed();
    } catch (err: any) {
      const msg: string = err.message || "Failed to execute action.";
      // 404 = action expired / not found in DB (stale session state)
      if (msg.toLowerCase().includes("not found") || msg.includes("404")) {
        setStatus("expired");
      } else {
        setStatus("error");
        setErrorMessage(msg);
      }
    }
  };

  const handleCancel = async () => {
    if (!block.action_id) return;
    try {
      await api.cancelAction(block.action_id);
    } catch {
      // Ignore cancel errors — action may already be gone
    }
    setStatus("dismissed");
  };

  if (status === "completed") {
    return (
      <div className="border border-emerald-600/50 bg-emerald-950/20 rounded-xl p-4 text-emerald-400 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Action Confirmed &amp; Executed</p>
          <p className="text-xs text-emerald-300/80">Calendar event created and added to organization audit logs.</p>
        </div>
      </div>
    );
  }

  if (status === "dismissed") {
    return null;
  }

  if (status === "expired") {
    return (
      <div className="border border-slate-700/60 bg-slate-900/60 rounded-xl p-4">
        <p className="text-xs text-amber-400 font-semibold mb-1">⚠ Proposal Expired</p>
        <p className="text-xs text-slate-400">
          This meeting proposal is no longer valid (the session has changed). Please send a new scheduling request to get a fresh proposal.
        </p>
        <button
          onClick={() => setStatus("dismissed")}
          className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="border border-amber-600/40 bg-amber-950/20 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
        <ShieldAlert className="w-4 h-4" />
        <span>Human-In-The-Loop Confirmation Required</span>
      </div>

      <p className="text-sm text-slate-200 mt-2 font-medium">{block.title}</p>

      {block.data && (
        <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
          {Object.entries(block.data).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-slate-400 capitalize">{k.replace("_", " ")}:</span>
              <span className="text-white font-medium">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {status === "error" && errorMessage && (
        <p className="text-xs text-rose-400 mt-2">{errorMessage}</p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleConfirm}
          disabled={status === "executing"}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
        >
          {status === "executing" ? "Executing..." : "Confirm & Schedule"}
        </button>
        <button
          onClick={handleCancel}
          disabled={status === "executing"}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// 7. Recommendation Block
function RecommendationBlock({
  title,
  items,
  onTrigger,
}: {
  title?: string;
  items: { label: string; action: string }[];
  onTrigger?: (action: string) => void;
}) {
  return (
    <div className="space-y-2 mt-2">
      {title && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>}
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onTrigger && onTrigger(item.label)}
            className="text-xs bg-slate-800/80 hover:bg-blue-600/30 hover:border-blue-500/50 border border-slate-700/80 text-slate-200 px-3 py-1.5 rounded-full transition shadow-sm"
          >
            {item.label} &rarr;
          </button>
        ))}
      </div>
    </div>
  );
}
