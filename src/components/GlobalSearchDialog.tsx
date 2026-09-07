"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  FolderKanban,
  CheckSquare,
  Ticket,
  AlertOctagon,
  ShieldCheck,
  Calendar,
  BookOpen,
  X,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { SearchResultItem } from "@/types/api";

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntity?: (entityType: string, id: string) => void;
}

export function GlobalSearchDialog({ isOpen, onClose, onSelectEntity }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await api.globalSearch(query.trim(), undefined, 25);
        setResults(data);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderKanban className="w-4 h-4 text-blue-400" />;
      case "task":
        return <CheckSquare className="w-4 h-4 text-teal-400" />;
      case "ticket":
        return <Ticket className="w-4 h-4 text-rose-400" />;
      case "risk":
        return <AlertOctagon className="w-4 h-4 text-amber-400" />;
      case "approval":
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case "calendar":
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      case "knowledge":
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, tasks, tickets, risks, approvals, calendar, knowledge..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800/80 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Searching across operational graph...</div>
          ) : query && results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching operational items found for &quot;{query}&quot;
            </div>
          ) : !query ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-1">
              <p>Type to search cross-domain operational data.</p>
              <p className="text-[11px] text-slate-600">Tenant-isolated across Projects, Tasks, Tickets, Risks, Calendar & Knowledge.</p>
            </div>
          ) : (
            results.map((item) => (
              <div
                key={`${item.entity_type}-${item.id}`}
                onClick={() => {
                  if (onSelectEntity) onSelectEntity(item.entity_type, item.id);
                  onClose();
                }}
                className="p-3 hover:bg-slate-800/60 rounded-xl cursor-pointer transition flex items-start gap-3"
              >
                <div className="mt-0.5 shrink-0">{getEntityIcon(item.entity_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 truncate">{item.title}</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      {item.entity_type}
                    </span>
                    {item.priority && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400">
                        {item.priority}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Multi-entity search indexed</span>
          <span className="font-mono">7 Operational Domains</span>
        </div>
      </div>
    </div>
  );
}
