"use client";

import React from "react";
import { TicketsView } from "@/components/TicketsView";
import { RoleGuard } from "@/components/RouteGuard";

export default function TicketsPage() {
  return (
    <RoleGuard requiredPermission="ticket.read">
      <TicketsView />
    </RoleGuard>
  );
}
