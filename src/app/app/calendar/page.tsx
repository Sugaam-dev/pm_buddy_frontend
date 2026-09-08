"use client";

import React from "react";
import { CalendarView } from "@/components/CalendarView";
import { RoleGuard } from "@/components/RouteGuard";

export default function CalendarPage() {
  return (
    <RoleGuard requiredPermission="calendar.read">
      <CalendarView />
    </RoleGuard>
  );
}
