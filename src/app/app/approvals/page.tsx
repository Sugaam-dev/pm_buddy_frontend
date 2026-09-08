"use client";

import React from "react";
import { ApprovalsView } from "@/components/ApprovalsView";
import { RoleGuard } from "@/components/RouteGuard";

export default function ApprovalsPage() {
  return (
    <RoleGuard requiredPermission="approval.read">
      <ApprovalsView />
    </RoleGuard>
  );
}
