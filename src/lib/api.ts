import { AIResponse, Approval, Project, Risk, Task, Ticket } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

class ApiClient {
  private token: string | null = null;
  private organizationId: string | null = "11111111-1111-1111-1111-111111111111"; // Acme Corp default

  setToken(token: string) {
    this.token = token;
  }

  isReady(): boolean {
    return !!this.token;
  }

  setOrganization(orgId: string) {
    this.organizationId = orgId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      throw new Error("Missing Bearer authentication token.");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
      "Authorization": `Bearer ${this.token}`,
    };
    if (this.organizationId) {
      headers["X-Organization-ID"] = this.organizationId;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }
    return res.json();
  }

  // For public endpoints that don't require authentication (login, personas)
  private async publicRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (this.organizationId) {
      headers["X-Organization-ID"] = this.organizationId;
    }
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }
    return res.json();
  }

  // Auth
  async login(email: string, password: string = "demo123"): Promise<{ access_token: string; user: any }> {
    const res = await this.publicRequest<{ access_token: string; user: any }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    this.setOrganization(res.user.organization_id);
    return res;
  }

  async signup(name: string, email: string, password: string): Promise<{ access_token: string; user: any }> {
    const res = await this.publicRequest<{ access_token: string; user: any }>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(res.access_token);
    this.setOrganization(res.user.organization_id);
    return res;
  }

  async getMe(): Promise<any> {
    return this.request("/api/v1/auth/me");
  }

  // AI PM Buddy Chat
  async sendChatMessage(prompt: string, conversationId?: string): Promise<AIResponse> {
    return this.request("/api/v1/chat/message", {
      method: "POST",
      body: JSON.stringify({ prompt, conversation_id: conversationId }),
    });
  }

  async getChatHistory(conversationId?: string): Promise<{ conversation_id: string | null; messages: any[] }> {
    return this.request(`/api/v1/chat/history${conversationId ? `?conversation_id=${conversationId}` : ""}`);
  }

  // HITL Actions
  async confirmAction(actionId: string, idempotencyKey?: string): Promise<any> {
    return this.request(`/api/v1/actions/${actionId}/confirm`, {
      method: "POST",
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
      body: JSON.stringify({ idempotency_key: idempotencyKey }),
    });
  }

  async cancelAction(actionId: string): Promise<any> {
    return this.request(`/api/v1/actions/${actionId}/cancel`, {
      method: "POST",
    });
  }

  // Business Domain Services
  async getProjects(): Promise<Project[]> {
    return this.request("/api/v1/projects/");
  }

  async getProjectDashboard(projectId: string): Promise<any> {
    return this.request(`/api/v1/projects/${projectId}/dashboard`);
  }

  async getTasks(params?: { is_blocked?: boolean; overdue_only?: boolean }): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params?.is_blocked !== undefined) query.set("is_blocked", String(params.is_blocked));
    if (params?.overdue_only) query.set("overdue_only", "true");
    return this.request(`/api/v1/tasks/?${query.toString()}`);
  }

  async getTickets(): Promise<Ticket[]> {
    return this.request("/api/v1/tickets/");
  }

  async getApprovals(breachedOnly: boolean = false): Promise<Approval[]> {
    return this.request(`/api/v1/approvals/?breached_only=${breachedOnly}`);
  }

  async getRisks(): Promise<Risk[]> {
    return this.request("/api/v1/risks/");
  }

  async getPersonas(): Promise<any[]> {
    return this.publicRequest("/api/v1/auth/personas");
  }

  // Calendar Module Services
  async getCalendarEvents(params?: {
    start_time?: string;
    end_time?: string;
    project_id?: string;
    status?: string;
    user_email?: string;
  }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.start_time) query.set("start_time", params.start_time);
    if (params?.end_time) query.set("end_time", params.end_time);
    if (params?.project_id) query.set("project_id", params.project_id);
    if (params?.status) query.set("status", params.status);
    if (params?.user_email) query.set("user_email", params.user_email);
    return this.request(`/api/v1/calendar/events?${query.toString()}`);
  }

  async getCalendarEvent(eventId: string): Promise<any> {
    return this.request(`/api/v1/calendar/events/${eventId}`);
  }

  async createCalendarEvent(data: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    attendees: string[];
    project_id?: string | null;
    location?: string;
    timezone?: string;
    meeting_type?: string;
  }): Promise<any> {
    return this.request("/api/v1/calendar/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCalendarEvent(eventId: string, data: Record<string, any>): Promise<any> {
    return this.request(`/api/v1/calendar/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async cancelCalendarEvent(eventId: string, reason?: string): Promise<any> {
    return this.request(`/api/v1/calendar/events/${eventId}`, {
      method: "DELETE",
      body: JSON.stringify({ reason: reason || "Cancelled by user" }),
    });
  }

  async getCalendarSlots(
    attendees: string[],
    duration_minutes: number = 30,
    search_date?: string
  ): Promise<any> {
    const query = new URLSearchParams();
    query.set("attendees", attendees.join(","));
    query.set("duration_minutes", String(duration_minutes));
    if (search_date) query.set("search_date", search_date);
    return this.request(`/api/v1/calendar/slots?${query.toString()}`);
  }

  // Knowledge Base & RAG
  async getKnowledgeDocuments(params?: { project_id?: string; document_type?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.project_id) query.set("project_id", params.project_id);
    if (params?.document_type) query.set("document_type", params.document_type);
    return this.request(`/api/v1/knowledge/documents?${query.toString()}`);
  }

  async getKnowledgeDocument(id: string): Promise<any> {
    return this.request(`/api/v1/knowledge/documents/${id}`);
  }

  async createKnowledgeDocument(data: {
    title: string;
    content: string;
    document_type?: string;
    project_id?: string | null;
  }): Promise<any> {
    return this.request("/api/v1/knowledge/documents", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async uploadKnowledgeDocument(file: File, projectId?: string, documentType?: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    if (projectId) formData.append("project_id", projectId);
    if (documentType) formData.append("document_type", documentType);

    const headers: Record<string, string> = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    if (this.organizationId) headers["X-Organization-ID"] = this.organizationId;

    const res = await fetch(`${API_BASE}/api/v1/knowledge/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }
    return res.json();
  }

  async searchKnowledge(query: string, projectId?: string, topK: number = 5): Promise<any[]> {
    const params = new URLSearchParams();
    params.set("query", query);
    params.set("top_k", String(topK));
    if (projectId) params.set("project_id", projectId);
    return this.request(`/api/v1/knowledge/search?${params.toString()}`);
  }

  // Intelligence & Briefings
  async getDailyBriefing(): Promise<any> {
    return this.request("/api/v1/intelligence/briefing");
  }

  async getActionRecommendations(): Promise<any[]> {
    const res = await this.request("/api/v1/intelligence/recommendations") as { count: number; recommendations: any[] };
    return (res as any)?.recommendations || [];
  }

  async getProjectHealthBreakdown(projectId: string): Promise<any> {
    return this.request(`/api/v1/intelligence/project-health/${projectId}`);
  }

  // Notifications
  async getNotifications(params?: { unread_only?: boolean; limit?: number }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.unread_only) query.set("unread_only", "true");
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request(`/api/v1/notifications?${query.toString()}`);
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
  }

  async markAllNotificationsRead(): Promise<any> {
    return this.request("/api/v1/notifications/read-all", { method: "POST" });
  }

  // Cross-Entity Global Search
  async globalSearch(query: string, types?: string[], limit: number = 20): Promise<any[]> {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("limit", String(limit));
    if (types && types.length > 0) {
      types.forEach((t) => params.append("types", t));
    }
    return this.request(`/api/v1/search?${params.toString()}`);
  }
}

export const api = new ApiClient();
