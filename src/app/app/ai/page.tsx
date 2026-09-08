"use client";

import React from "react";
import { PMBuddyChat } from "@/components/PMBuddyChat";
import { RoleGuard } from "@/components/RouteGuard";

export default function AIPage() {
  return (
    <RoleGuard requiredPermission="ai.chat">
      <div className="h-[calc(100vh-8rem)]">
        <PMBuddyChat />
      </div>
    </RoleGuard>
  );
}
