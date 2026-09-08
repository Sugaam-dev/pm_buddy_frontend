"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [currentUser, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-200">Verifying Identity & Tenant Security</p>
            <p className="text-xs text-slate-500 font-mono mt-1">PM Buddy · PMRG Solution LLP</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export function RoleGuard({ children, requiredPermission, requiredRole }: RoleGuardProps) {
  const { currentUser, hasPermission, hasRole } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (!currentUser) return false;
    if (requiredRole && !hasRole(requiredRole)) return false;
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    return true;
  }, [currentUser, requiredPermission, requiredRole, hasPermission, hasRole]);

  useEffect(() => {
    if (currentUser && !isAuthorized) {
      router.replace("/403");
    }
  }, [currentUser, isAuthorized, router]);

  if (!isAuthorized) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Access Restricted</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
          Your active role ({currentUser?.role || "Unknown"}) lacks the required permission ({requiredPermission || requiredRole}) to view this operational resource.
        </p>
        <button
          onClick={() => router.push("/app/dashboard")}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
