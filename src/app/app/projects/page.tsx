"use client";

import React from "react";
import { ProjectsView } from "@/components/ProjectsView";
import { RoleGuard } from "@/components/RouteGuard";

export default function ProjectsPage() {
  return (
    <RoleGuard requiredPermission="project.read">
      <ProjectsView />
    </RoleGuard>
  );
}
