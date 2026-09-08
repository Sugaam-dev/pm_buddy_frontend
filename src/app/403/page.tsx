"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* Header */}
      <header className="h-16 border-b border-slate-800/80 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/pmrg-logo.png"
            alt="PMRG Solution LLP"
            className="h-8 w-auto object-contain"
          />
          <div>
            <span className="font-bold text-sm tracking-wide text-white">PM BUDDY</span>
            <span className="text-[10px] block text-slate-400 font-mono">PMRG Solution LLP</span>
          </div>
        </Link>
        <Link
          href="/app/dashboard"
          className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to App
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/30">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>HTTP 403 · FORBIDDEN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Access Restricted
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              You don&apos;t have permission to access this area. Your current role does not have authorization to view this operational resource or perform this action.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition flex items-center justify-center"
            >
              Switch Account
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-500 font-mono">
            Tenant Isolation Active · PMRG Solution LLP
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} PMRG Solution LLP. All rights reserved.
      </footer>
    </div>
  );
}
