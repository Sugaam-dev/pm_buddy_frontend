"use client";

import React from "react";
import { RisksView } from "@/components/RisksView";
import { RoleGuard } from "@/components/RouteGuard";

export default function RisksPage() {
  return (
    <RoleGuard requiredPermission="risk.read">
      <RisksView />
    </RoleGuard>
  );
}
