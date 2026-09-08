"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Filter, Layers, CheckSquare, Ticket, AlertOctagon, Calendar, BookOpen, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RouteGuard";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const types = typeFilter === "all" ? undefined : [typeFilter];
      const data = await api.globalSearch(query.trim(), types, 30);
      setResults(data || []);
    } catch (err) {
      console.error("Global search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "project": return Layers;
      case "task": return CheckSquare;
      case "ticket": return Ticket;
      case "risk": return AlertOctagon;
      case "approval": return ShieldCheck;
      case "calendar": return Calendar;
      case "knowledge": return BookOpen;
      default: return Search;
    }
  };

  const handleSelect = (item: any) => {
    const routeMap: Record<string, string> = {
      project: "/app/projects",
      task: "/app/tasks",
      ticket: "/app/tickets",
      risk: "/app/risks",
      approval: "/app/approvals",
      calendar: "/app/calendar",
      knowledge: "/app/knowledge",
    };
    if (routeMap[item.entity_type]) {
      router.push(routeMap[item.entity_type]);
    }
  };

  return (
    <RoleGuard requiredPermission="project.read">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Search className="w-5 h-5 text-blue-400" />
            Global Cross-Entity Search
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Instantly search across tasks, incident tickets, project health, stage gates, risk matrix, and RAG knowledge.
          </p>
        </div>

        {/* Search Bar & Filters */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by keywords, IDs, ticket numbers, or topics..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl transition flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Filter className="w-3 h-3 text-slate-500" />
              Filter by entity:
            </span>
            {["all", "project", "task", "ticket", "approval", "risk", "knowledge"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono capitalize transition ${
                  typeFilter === t
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </form>

        {/* Results List */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-mono">
            Searching across organization records...
          </div>
        ) : searched && results.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
            <Search className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No results found</p>
            <p className="text-xs text-slate-500">Try adjusting your search terms or entity filters.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {results.map((item, idx) => {
              const Icon = getIcon(item.entity_type);
              return (
                <div
                  key={item.id || idx}
                  onClick={() => handleSelect(item)}
                  className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/30 transition cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{item.title || item.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.entity_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.description || item.snippet || "No description"}</p>
                    </div>
                  </div>

                  <span className="text-xs text-blue-400 font-medium shrink-0">
                    View &rarr;
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
