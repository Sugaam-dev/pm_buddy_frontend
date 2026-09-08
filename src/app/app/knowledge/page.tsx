"use client";

import React from "react";
import { KnowledgeView } from "@/components/KnowledgeView";
import { RoleGuard } from "@/components/RouteGuard";

export default function KnowledgePage() {
  return (
    <RoleGuard requiredPermission="project.read">
      <KnowledgeView />
    </RoleGuard>
  );
}
