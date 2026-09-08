"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, Sparkles, Building2 } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/app/dashboard";

  const { currentUser, login, personas, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (!authLoading && currentUser) {
      router.replace(redirectPath);
    }
  }, [currentUser, authLoading, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your work email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push(redirectPath);
    } catch (err: any) {
      console.error("Login failed:", err);
      setErrorMessage(
        err.message || "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSelectPersona = async (personaEmail: string) => {
    setEmail(personaEmail);
    setPassword("demo123");
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login(personaEmail, "demo123");
      router.push(redirectPath);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate persona.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-800/80 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/pmrg-logo.png"
            alt="PMRG Solution LLP"
            className="h-8 w-auto object-contain transition group-hover:opacity-90"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">PM BUDDY</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                SaaS
              </span>
            </div>
            <span className="text-[10px] block text-slate-400 font-mono">PMRG Solution LLP</span>
          </div>
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-slate-400 hover:text-slate-200 transition"
        >
          &larr; Back to Home
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Sign in to PM Buddy
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              AI-Native Operational Intelligence & Governance Platform
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("For security, password reset requests are governed by your tenant organization administrator.");
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-400 hover:text-blue-300 transition"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Demo Persona Switcher (For Evaluation & Review) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick-Test Seeded Roles
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Sign In</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelectPersona("sarah@acme.com")}
                className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-purple-500/30 transition group"
              >
                <div className="font-medium text-slate-200 text-[11px] group-hover:text-purple-300">Sarah Admin</div>
                <div className="text-[10px] text-purple-400 font-mono">Role: admin (*)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectPersona("alice@acme.com")}
                className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-blue-500/30 transition group"
              >
                <div className="font-medium text-slate-200 text-[11px] group-hover:text-blue-300">Alice PM</div>
                <div className="text-[10px] text-blue-400 font-mono">Role: PM</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectPersona("charlie@acme.com")}
                className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-amber-500/30 transition group"
              >
                <div className="font-medium text-slate-200 text-[11px] group-hover:text-amber-300">Charlie CTO</div>
                <div className="text-[10px] text-amber-400 font-mono">Role: CTO</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectPersona("bob@acme.com")}
                className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-teal-500/30 transition group"
              >
                <div className="font-medium text-slate-200 text-[11px] group-hover:text-teal-300">Bob Lead</div>
                <div className="text-[10px] text-teal-400 font-mono">Role: TEAM_LEAD</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectPersona("rahul@acme.com")}
                className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-emerald-500/30 transition group"
              >
                <div className="font-medium text-slate-200 text-[11px] group-hover:text-emerald-300">Rahul Eng</div>
                <div className="text-[10px] text-emerald-400 font-mono">Role: ENGINEER</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectPersona("dave@acme.com")}
                className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-700 transition group"
              >
                <div className="font-medium text-slate-200 text-[11px] group-hover:text-slate-300">Dave Viewer</div>
                <div className="text-[10px] text-slate-400 font-mono">Role: VIEWER (Read-only)</div>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => handleQuickSelectPersona("bob@globex.com")}
                className="w-full p-2 text-left rounded-xl bg-purple-950/20 hover:bg-purple-900/30 border border-purple-800/40 transition flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-purple-200 text-[11px]">Bob Globex (Other Tenant)</span>
                  <span className="block text-[10px] text-purple-400 font-mono">Tenant B · Cross-Tenant RBAC Test</span>
                </div>
                <Building2 className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Tenant RBAC · Deterministic Audit Enforced</span>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-xs">
          Loading PM Buddy Authentication...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
