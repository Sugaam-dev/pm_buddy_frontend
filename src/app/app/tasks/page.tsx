"use client";

import React from "react";
import { TasksView } from "@/components/TasksView";
import { RoleGuard } from "@/components/RouteGuard";

export default function TasksPage() {
  return (
    <RoleGuard requiredPermission="task.read">
      <TasksView />
    </RoleGuard>
  );
}
