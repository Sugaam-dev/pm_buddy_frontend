import { UserPersona } from "@/types/api";

export function hasPermission(user: UserPersona | null, requiredPermission: string): boolean {
  if (!user) return false;
  if (user.permissions.includes("*") || user.permissions.includes("admin")) return true;
  return user.permissions.includes(requiredPermission);
}

export function hasRole(user: UserPersona | null, role: string): boolean {
  if (!user) return false;
  return user.role.toLowerCase() === role.toLowerCase();
}

export function canAccessTab(user: UserPersona | null, tabId: string): boolean {
  if (!user) return false;
  if (user.permissions.includes("*") || user.permissions.includes("admin")) return true;

  switch (tabId) {
    case "dashboard":
      return hasPermission(user, "project.read");
    case "tasks":
      return hasPermission(user, "task.read");
    case "tickets":
      return hasPermission(user, "ticket.read");
    case "approvals":
      return hasPermission(user, "approval.read");
    case "risks":
      return hasPermission(user, "risk.read");
    case "calendar":
      return hasPermission(user, "calendar.read");
    case "knowledge":
      return hasPermission(user, "knowledge.read");
    case "action_center":
      return true; // Action center is visible to all authenticated personas
    case "chat":
      return hasPermission(user, "ai.chat");
    default:
      return true;
  }
}
