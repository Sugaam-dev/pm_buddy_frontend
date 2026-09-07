"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { NavTab, Navigation } from "@/components/Navigation";
import { PMBuddyChat } from "@/components/PMBuddyChat";
import { DashboardView } from "@/components/DashboardView";
import { ProjectsView } from "@/components/ProjectsView";
import { ApprovalsView } from "@/components/ApprovalsView";
import { TasksView } from "@/components/TasksView";
import { TicketsView } from "@/components/TicketsView";
import { RisksView } from "@/components/RisksView";
import { CalendarView } from "@/components/CalendarView";
import { KnowledgeView } from "@/components/KnowledgeView";
import { ActionCenterView } from "@/components/ActionCenterView";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("pm_buddy");

  const handleSelectEntity = (entityType: string) => {
    switch (entityType) {
      case "project":
        setActiveTab("projects");
        break;
      case "task":
        setActiveTab("tasks");
        break;
      case "ticket":
        setActiveTab("tickets");
        break;
      case "risk":
        setActiveTab("risks");
        break;
      case "approval":
        setActiveTab("approvals");
        break;
      case "calendar":
        setActiveTab("calendar");
        break;
      case "knowledge":
        setActiveTab("knowledge");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onSelectEntity={handleSelectEntity} />

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "pm_buddy" && <PMBuddyChat />}
          {activeTab === "action_center" && <ActionCenterView />}
          {activeTab === "dashboard" && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === "projects" && <ProjectsView />}
          {activeTab === "approvals" && <ApprovalsView />}
          {activeTab === "tasks" && <TasksView />}
          {activeTab === "tickets" && <TicketsView />}
          {activeTab === "risks" && <RisksView />}
          {activeTab === "calendar" && <CalendarView />}
          {activeTab === "knowledge" && <KnowledgeView />}
        </main>
      </div>
    </div>
  );
}
