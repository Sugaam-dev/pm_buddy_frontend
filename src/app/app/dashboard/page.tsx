"use client";

import React from "react";
import { DashboardView } from "@/components/DashboardView";
import { RoleGuard } from "@/components/RouteGuard";

export default function DashboardPage() {
  return (
    <RoleGuard requiredPermission="project.read">
      <DashboardView />
    </RoleGuard>
  );
}
