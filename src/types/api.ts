export type PriorityTier = "P0" | "P1" | "P2" | "P3";
export type ProjectHealth = "healthy" | "caution" | "at_risk";
export type SLAStatus = "normal" | "warning" | "breached";

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  status: string;
  health: ProjectHealth;
  budget: number;
  spent: number;
  target_date: string | null;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: string;
  priority: PriorityTier;
  priority_score: number;
  assignee_id: string | null;
  due_date: string | null;
  is_blocked: boolean;
  blocker_reason: string | null;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  priority: PriorityTier;
  status: string;
  affected_service: string | null;
  assignee_id: string | null;
  sla_status: SLAStatus;
  is_breached: boolean;
  sla_due_at: string;
  breach_risk_score: number;
  probable_cause: string | null;
  suggested_resolution: string | null;
}

export interface Approval {
  id: string;
  project_id: string;
  project_name: string;
  project_key: string;
  title: string;
  description: string;
  stage: string;
  status: string;
  approver_id: string;
  sla_due_at: string;
  sla_status: SLAStatus;
  is_breached: boolean;
  days_overdue: number;
}

export interface Risk {
  id: string;
  project_id: string;
  project_name: string;
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  score: number;
  status: string;
  owner_id: string | null;
  mitigation_plan: string | null;
}

export interface CalendarSlot {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  label: string;
}

export interface ActionProposal {
  action_id: string;
  tool_name: string;
  action_type: string;
  payload: Record<string, any>;
  status: string;
  expires_at: string;
}

export interface StructuredBlock {
  type:
    | "text"
    | "project_card"
    | "task_list"
    | "ticket_list"
    | "approval_list"
    | "calendar_slots"
    | "action_confirmation"
    | "recommendation"
    | "table";
  title?: string;
  data?: any;
  slots?: CalendarSlot[];
  items?: { label: string; action: string }[];
  action_id?: string;
  expires_at?: string;
}

export interface CalendarParticipant {
  id: string;
  user_email: string;
  user_id?: string | null;
  response_status: "accepted" | "declined" | "tentative" | "needs_action";
}

export interface CalendarEvent {
  id: string;
  organization_id: string;
  external_event_id?: string | null;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  attendees: string[];
  participants: CalendarParticipant[];
  project_id?: string | null;
  timezone: string;
  location?: string | null;
  meeting_type: string;
  status: "confirmed" | "tentative" | "cancelled";
  meet_url?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPersona {
  user_id: string;
  email: string;
  name: string;
  organization_id: string;
  role: string;
  permissions: string[];
}

export interface AIResponse {
  conversation_id: string;
  text: string;
  blocks: StructuredBlock[];
}

export interface KnowledgeDocument {
  id: string;
  organization_id: string;
  project_id?: string | null;
  title: string;
  source_type: string;
  source_uri?: string | null;
  document_type: string;
  content_hash?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeSearchResult {
  chunk_id: string;
  document_id: string;
  document_title: string;
  document_type: string;
  project_id?: string | null;
  chunk_index: number;
  content: string;
  similarity: number;
  citation: string;
}

export interface NotificationItem {
  id: string;
  organization_id: string;
  user_id?: string | null;
  title: string;
  message: string;
  type: string;
  severity: "info" | "warning" | "critical";
  is_read: boolean;
  link_url?: string | null;
  created_at: string;
}

export interface TaskDependency {
  id: string;
  organization_id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: string;
  created_at: string;
}

export interface HealthBreakdown {
  score: number;
  status: "healthy" | "caution" | "at_risk";
  factors: {
    base: number;
    p0_overdue_penalty: number;
    p1_overdue_penalty: number;
    sla_breached_ticket_penalty: number;
    sla_warning_ticket_penalty: number;
    critical_risk_penalty: number;
    overdue_approval_penalty: number;
    blocked_task_penalty: number;
  };
  metrics: {
    total_tasks: number;
    overdue_p0_tasks: number;
    overdue_p1_tasks: number;
    breached_tickets: number;
    warning_tickets: number;
    critical_risks: number;
    overdue_approvals: number;
    blocked_tasks: number;
  };
}

export interface DailyBriefing {
  date: string;
  todays_meetings: any[];
  p0_p1_tasks: Task[];
  sla_at_risk_tickets: Ticket[];
  pending_approvals: Approval[];
  top_risks: Risk[];
  summary: {
    meeting_count: number;
    urgent_task_count: number;
    sla_risk_ticket_count: number;
    pending_approval_count: number;
    critical_risk_count: number;
  };
}

export interface ActionRecommendation {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  entity_type: string;
  entity_id: string;
  proposed_action: string;
  rationale: string;
  hitl_required: boolean;
  action_proposal?: Record<string, any>;
}

export interface SearchResultItem {
  entity_type: string;
  id: string;
  title: string;
  description: string;
  status?: string;
  priority?: string;
  score?: number;
  extra?: Record<string, any>;
}
