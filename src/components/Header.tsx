"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Radio,
  UserCheck,
  Search,
  Menu,
  LogOut,
  Shield,
  User,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NotificationsPopover } from "@/components/NotificationsPopover";
import { GlobalSearchDialog } from "@/components/GlobalSearchDialog";

interface HeaderProps {
  onSelectEntity?: (type: string, id: string) => void;
  onMenuClick?: () => void;
}

export function Header({ onSelectEntity, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { currentUser, personas, switchPersona, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "pm":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "cto":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "team_lead":
        return "bg-teal-500/20 text-teal-300 border-teal-500/30";
      case "engineer":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "viewer":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "PM";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const isAcme = currentUser?.organization_id === "11111111-1111-1111-1111-111111111111";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 sm:px-8 flex items-center justify-between z-20 relative">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Tenant Organization Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className={`w-2 h-2 rounded-full ${isAcme ? "bg-blue-500" : "bg-purple-500"}`} />
          <span>
            Org: <strong>{isAcme ? "Acme Corp" : "Globex Inc (Tenant B)"}</strong>
          </span>
        </div>

        {/* Realtime Outbox Status */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Realtime Outbox Connected</span>
        </div>

        {/* Global Search Quick Trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search across entities...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Persona Switcher Dropdown (for quick testing/RBAC switching) */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={loading}
            className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700/60 px-2.5 sm:px-3 py-1.5 rounded-lg transition text-slate-200"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">
              Persona: <strong>{currentUser?.name || "Alice PM"}</strong>
            </span>
            <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${getRoleColor(currentUser?.role)}`}>
              {currentUser?.role || "PM"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Switch Seeded Persona</span>
                <span className="text-[9px] font-mono text-emerald-400">RBAC Testing</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {personas.map((persona) => {
                  const isActive = currentUser?.email === persona.email;
                  return (
                    <button
                      key={persona.email}
                      onClick={() => {
                        switchPersona(persona.email);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                        isActive ? "bg-slate-800/80 text-white font-medium" : "text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-100">{persona.name}</div>
                        <div className="text-[11px] text-slate-400">{persona.email}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${getRoleColor(persona.role)}`}>
                          {persona.role}
                        </span>
                        {persona.organization_id !== "11111111-1111-1111-1111-111111111111" && (
                          <span className="text-[9px] text-purple-400 bg-purple-950/60 border border-purple-800/40 px-1 rounded">
                            Tenant B
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <NotificationsPopover />

        {/* User Profile & Logout Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-xs font-semibold text-blue-300">
              {getInitials(currentUser?.name)}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-medium text-slate-200">{currentUser?.name || "Alice PM"}</p>
              <p className="text-[10px] text-slate-400 font-mono">{currentUser?.role || "PM"}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-semibold text-white">{currentUser?.name || "Alice PM"}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser?.email || "alice@acme.com"}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/app/settings");
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile & Tenant Settings</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/");
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Landing Page</span>
                </button>
              </div>

              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectEntity={onSelectEntity}
      />
    </header>
  );
}
