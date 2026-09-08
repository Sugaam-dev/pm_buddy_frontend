"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { RoleGuard } from "@/components/RouteGuard";
import { Settings, Shield, User, Building, Key, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const isAcme = currentUser?.organization_id === "11111111-1111-1111-1111-111111111111";

  return (
    <RoleGuard requiredPermission="project.read">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-400" />
            Account & Organization Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your user persona identity, tenant context, and active RBAC permissions.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <User className="w-4 h-4 text-blue-400" />
            <span>Active Identity & Membership</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Full Name</span>
              <p className="text-sm font-semibold text-white mt-1">{currentUser?.name || "Alice PM"}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Work Email</span>
              <p className="text-sm font-semibold text-white mt-1 font-mono">{currentUser?.email || "alice@acme.com"}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Assigned System Role</span>
              <p className="text-sm font-semibold text-blue-400 mt-1 font-mono">{currentUser?.role || "PM"}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">User UUID</span>
              <p className="text-xs font-mono text-slate-300 mt-1 truncate">{currentUser?.user_id || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Tenant Organization Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Building className="w-4 h-4 text-purple-400" />
            <span>Tenant Isolation & Organization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Organization Name</span>
              <p className="text-sm font-semibold text-white mt-1">
                {isAcme ? "Acme Corp (Primary Tenant)" : "Globex Systems (Tenant B)"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Tenant Organization ID</span>
              <p className="text-xs font-mono text-slate-300 mt-1 truncate">{currentUser?.organization_id || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Active RBAC Permissions Matrix */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Active RBAC Capabilities ({currentUser?.permissions?.length || 0})</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Server Authoritative
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {currentUser?.permissions?.map((perm) => (
              <span
                key={perm}
                className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{perm}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
