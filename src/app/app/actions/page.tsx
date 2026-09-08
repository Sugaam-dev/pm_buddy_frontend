"use client";

import React from "react";
import { ActionCenterView } from "@/components/ActionCenterView";
import { RoleGuard } from "@/components/RouteGuard";

export default function ActionsPage() {
  return (
    <RoleGuard requiredPermission="project.read">
      <ActionCenterView />
    </RoleGuard>
  );
}
