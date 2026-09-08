"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Bot,
  Layers,
  CheckSquare,
  AlertTriangle,
  ShieldCheck,
  AlertOctagon,
  BookOpen,
  Calendar,
  Zap,
  Bell,
  Lock,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Users,
  EyeOff,
  GitPullRequest,
  Activity,
  FileText,
  Sliders,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-50 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/pmrg-logo.png"
            alt="PMRG Solution LLP"
            className="h-8 w-auto object-contain transition group-hover:opacity-90"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">PM BUDDY</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PMRG Solution
              </span>
            </div>
            <span className="text-[10px] block text-slate-400 font-mono">PMRG Solution LLP</span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#problems" className="hover:text-white transition">Problems</a>
          <a href="#solutions" className="hover:text-white transition">Solutions</a>
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#hitl" className="hover:text-white transition">HITL Safety</a>
          <a href="#security" className="hover:text-white transition">Security</a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <Link
              href="/app/dashboard"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition flex items-center gap-2"
            >
              <span>Go to App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 sm:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Operational Intelligence for Modern Engineering Organizations</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            PM Buddy — AI-Native Operational Intelligence for Engineering Teams
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            PM Buddy helps engineering organizations understand what needs attention, identify blockers, manage delivery risk, coordinate work, and make operational decisions — while keeping humans in control of critical actions.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Tenant Isolation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Deterministic RBAC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Human-In-The-Loop Guardrails</span>
            </div>
          </div>
        </div>

        {/* Product UI Preview / Mock Dashboard */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/80 p-2 shadow-2xl shadow-blue-950/40">
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            {/* Window bar */}
            <div className="h-9 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-[11px] font-mono text-slate-400">pm-buddy.pmrgsolution.com/app/dashboard</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Realtime Outbox Connected
              </div>
            </div>

            {/* Dashboard Mock Content */}
            <div className="p-6 space-y-6">
              {/* Alert banner */}
              <div className="border border-rose-800/60 bg-rose-950/20 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      SLA Breach Warning: Cloud Infrastructure Gate Overdue
                    </p>
                    <p className="text-[11px] text-rose-300/80">
                      Project Alpha Architecture Approval reached SLA deadline. Escalation queued.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-semibold bg-rose-600 text-white rounded-lg">
                  Review Gate
                </span>
              </div>

              {/* Metric widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Portfolio Status</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">HEALTHY (92%)</div>
                  <span className="text-[10px] text-slate-500">3 of 3 projects on track</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">SLA Breaches</span>
                  <div className="text-lg font-bold text-rose-400 mt-1">1 Critical</div>
                  <span className="text-[10px] text-slate-500">Requires review</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">P0 Critical Tasks</span>
                  <div className="text-lg font-bold text-amber-400 mt-1">2 Active</div>
                  <span className="text-[10px] text-slate-500">1 blocked on dependencies</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">AI Proposals (HITL)</span>
                  <div className="text-lg font-bold text-blue-400 mt-1">2 Awaiting Sign-off</div>
                  <span className="text-[10px] text-slate-500">Zero unconfirmed writes</span>
                </div>
              </div>

              {/* Mini row preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>Task Dependency Graph</span>
                    <span className="text-[10px] text-indigo-400 font-mono">Priority Engine</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">Patch Payment Gateway SSL Vulnerability</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300">P0</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300">Deploy Kubernetes Helm Manifests</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300">P1</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>AI Operations Assistant</span>
                    <span className="text-[10px] text-emerald-400 font-mono">HITL Interceptor</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-800/40 text-xs text-blue-300 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-[11px]">Proposed Meeting: Architecture Sign-off</p>
                      <p className="text-[10px] text-slate-400">Tomorrow at 3:00 PM · Alice, Rahul</p>
                    </div>
                    <span className="px-2 py-1 text-[10px] font-semibold bg-blue-600 text-white rounded-md">
                      Confirm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problems" className="py-20 border-t border-slate-800/80 bg-slate-900/30 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
              The Reality of Engineering Operations
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              Why Engineering Delivery Breaks Down
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              High-growth technical teams struggle with fragmented context, missed deadlines, and manual coordination overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Scattered Operational Information", desc: "Data spread across Jira, GitHub, Slack, Notion, and email with zero unified operational picture.", icon: Layers },
              { title: "Hidden Blockers & Dependencies", desc: "Unseen technical roadblocks that stay dormant until a critical sprint milestone is already missed.", icon: EyeOff },
              { title: "Missed SLA Deadlines", desc: "Customer incidents and architectural reviews decaying silently without proactive countdown alerts.", icon: Clock },
              { title: "Unclear Project Health", desc: "Subjective green-yellow-red project status meetings disconnected from actual work delivery data.", icon: Activity },
              { title: "Manual Coordination & Syncs", desc: "Hours wasted every week manually scheduling calendar syncs, tracking down participants, and rescheduling.", icon: Users },
              { title: "Meeting Overload", desc: "Engineers pulled away from coding into endless status meetings simply to communicate work updates.", icon: Calendar },
              { title: "Governance Bottlenecks", desc: "Security, compliance, and architectural stage gates stalled waiting on single-point-of-failure approvers.", icon: ShieldCheck },
              { title: "Scattered Knowledge Documents", desc: "Outdated PRDs, postmortems, and runbooks making root-cause discovery painful during incidents.", icon: FileText },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white">{p.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solutions" className="py-20 border-t border-slate-800/80 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Deterministic Operations & AI
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              How PM Buddy Solves Engineering Friction
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              An intelligent, deterministic operational backbone that eliminates guesswork while ensuring human supervision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "AI Operational Intelligence", desc: "Synthesizes cross-system telemetry into instant daily briefings, answering operational inquiries in natural language.", icon: Bot },
              { title: "Deterministic Project Health", desc: "Algorithmic health scores based on blocked tasks, SLA violations, budget burn, and delivery velocity.", icon: Activity },
              { title: "Task Prioritization & Blocker Detection", desc: "Automated calculation of P0-P3 severity, blast radius, and downstream dependency chain impact.", icon: CheckSquare },
              { title: "Incident & SLA Management", desc: "Automated breach risk scoring, assignee recommendations, and escalation alerts before SLAs decay.", icon: AlertTriangle },
              { title: "Governance Stage Gates", desc: "Auditable sign-off workflows with deterministic SLA timeframes and explicit approver tracking.", icon: ShieldCheck },
              { title: "Intelligent Meeting Coordination", desc: "Autonomous participant slot discovery, conflict detection, and meeting proposals with 1-click confirmation.", icon: Calendar },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition space-y-3 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-slate-900/30 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Complete Feature Matrix
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              Built for Engineering Leaders & High-Velocity Teams
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              10 deeply integrated operational modules working together seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "AI Operations Assistant", desc: "Natural language assistant with Gemini tool calling and strict schema validation.", icon: Bot },
              { title: "Project Health Engine", desc: "Real-time health breakdown scoring 0-100 with driving negative factor identification.", icon: Layers },
              { title: "Task Intelligence", desc: "Priority ranking by severity, blast radius, SLA decay, and dependency bottlenecks.", icon: CheckSquare },
              { title: "Incident & SLA Management", desc: "High-severity ticket tracking with automated assignee ranking and countdown timers.", icon: AlertTriangle },
              { title: "Governance Stage Gates", desc: "Strict architecture, security, and finance gates with explicit sign-off logs.", icon: ShieldCheck },
              { title: "Risk Management Matrix", desc: "5x5 Likelihood x Impact matrix with owner assignment and mitigation tracking.", icon: AlertOctagon },
              { title: "Knowledge Base & RAG", desc: "Vector-embedded documentation with grounded citations and source verification.", icon: BookOpen },
              { title: "Intelligent Calendar", desc: "Slot discovery, multi-calendar conflict detection, and automated meeting proposals.", icon: Calendar },
              { title: "Action Center", desc: "Centralized queue of pending HITL AI proposals with 15-minute idempotency keys.", icon: Zap },
              { title: "In-App Notifications", desc: "Instant operational alerts for SLA breaches, task assignments, and gate reviews.", icon: Bell },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{f.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HITL Section */}
      <section id="hitl" className="py-20 border-t border-slate-800/80 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-slate-950 p-8 sm:p-12 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-blue-400 uppercase font-semibold">Human-In-The-Loop Safety</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">AI Proposes. Humans Confirm.</h2>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            Unlike uncontrolled autonomous agents that create phantom records or alter schedules unprompted, PM Buddy enforces strict Human-In-The-Loop (HITL) safety. Sensitive actions — creating meetings, cancelling events, assigning tickets, escalating approvals — are intercepted and presented as structured proposals with 15-minute expirations and cryptographically unique idempotency keys.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-blue-400">01. Proposal Interception</span>
              <p className="text-xs text-slate-300">AI builds a typed mutation proposal rather than executing directly against databases.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-emerald-400">02. Human Sign-off</span>
              <p className="text-xs text-slate-300">Authorized engineers review parameters and click Confirm or Cancel with one click.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-purple-400">03. Idempotent Execution</span>
              <p className="text-xs text-slate-300">Actions execute through strict service layers with full audit log trails and zero duplicate runs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 border-t border-slate-800/80 bg-slate-900/30 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
              Enterprise Trust & Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              Enterprise Security from Day One
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              Built with uncompromising multi-tenant isolation, cryptographically validated JWTs, and deterministic RBAC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Deterministic RBAC</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                6 core roles (Admin, PM, CTO, Team Lead, Engineer, Viewer) with granular permission checks on both frontend and backend.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Strict Tenant Isolation</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All database rows, API requests, and calendar connections are partitioned by organization ID with zero cross-tenant leakage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Immutable Auditability</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Every AI suggestion, human confirmation, calendar booking, and permission check is permanently logged with before/after state diffs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Zero Client Secret Leakage</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gemini API keys, database credentials, and service role secrets reside exclusively on the server with zero browser exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-slate-800/80 px-6 sm:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Start using PM Buddy today
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
            Bring operational intelligence, automated blocker detection, and safe AI meeting scheduling to your engineering team.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition"
            >
              Sign In to Organization
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-12 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/pmrg-logo.png"
              alt="PMRG Solution LLP"
              className="h-8 w-auto object-contain"
            />
            <div>
              <p className="text-xs font-bold text-white">PM BUDDY</p>
              <p className="text-[10px] text-slate-500 font-mono">by PMRG Solution LLP</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <a href="#problems" className="hover:text-white transition">Problems</a>
            <a href="#solutions" className="hover:text-white transition">Solutions</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#hitl" className="hover:text-white transition">HITL Safety</a>
            <a href="#security" className="hover:text-white transition">Security</a>
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition">Get Started</Link>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} PMRG Solution LLP. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
