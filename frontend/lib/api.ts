import { ApiError, type AggregateRun, type OrganizationProfile, type OrganizationSettings, type ReviewSession, type TeamMember, type User } from "@/lib/types";

function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

function normalizeErrorDetail(detail: unknown): string {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => normalizeErrorDetail(item))
      .filter((item) => item && item !== "[object Object]");
    return parts.length ? parts.join(" ") : "Request failed.";
  }
  if (detail && typeof detail === "object") {
    const maybeMessage = (detail as { msg?: unknown; message?: unknown; detail?: unknown }).msg
      ?? (detail as { msg?: unknown; message?: unknown; detail?: unknown }).message
      ?? (detail as { msg?: unknown; message?: unknown; detail?: unknown }).detail;
    if (typeof maybeMessage === "string") {
      return maybeMessage;
    }
    const maybeLoc = (detail as { loc?: unknown }).loc;
    if (Array.isArray(maybeLoc) && typeof maybeMessage === "string") {
      return `${maybeLoc.join(".")}: ${maybeMessage}`;
    }
  }
  return "Request failed.";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getApiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "Request failed.";
    try {
      const payload = (await response.json()) as { detail?: unknown };
      if (payload.detail !== undefined) {
        detail = normalizeErrorDetail(payload.detail);
      }
    } catch {}
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  login(payload: { email: string; password: string }) {
    return request<User>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
  },
  logout() {
    return request<{ message: string }>("/api/auth/logout", { method: "POST" });
  },
  refresh() {
    return request<{ message: string; expires_in_minutes: number }>("/api/auth/refresh", { method: "POST" });
  },
  me() {
    return request<User>("/api/auth/me");
  },
  requestPasswordReset(email: string) {
    return request<{ message: string; reset_token: string }>("/api/auth/password-reset/request", { method: "POST", body: JSON.stringify({ email }) });
  },
  confirmPasswordReset(token: string, newPassword: string) {
    return request<{ message: string }>("/api/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ token, new_password: newPassword }) });
  },
  registerOrganization(payload: Record<string, unknown>) {
    return request<OrganizationProfile>("/api/onboarding/register", { method: "POST", body: JSON.stringify(payload) });
  },
  getOrganization() {
    return request<OrganizationProfile>("/api/organizations/me");
  },
  updateOrganization(payload: Record<string, unknown>) {
    return request<OrganizationProfile>("/api/organizations/me", { method: "PATCH", body: JSON.stringify(payload) });
  },
  addFacility(payload: Record<string, unknown>) {
    return request<OrganizationProfile["facilities"][number]>("/api/organizations/me/facilities", { method: "POST", body: JSON.stringify(payload) });
  },
  addContact(payload: Record<string, unknown>) {
    return request<OrganizationProfile["contacts"][number]>("/api/organizations/me/contacts", { method: "POST", body: JSON.stringify(payload) });
  },
  getTeam() {
    return request<TeamMember[]>("/api/organizations/me/team");
  },
  inviteUser(payload: Record<string, unknown>) {
    return request<{ invite_id: string; email: string; role: string; expires_at: string; invite_token: string }>("/api/users/invite", { method: "POST", body: JSON.stringify(payload) });
  },
  updateUserRole(userId: string, role: string) {
    return request<User>(`/api/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
  },
  updateUserStatus(userId: string, isActive: boolean) {
    return request<User>(`/api/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) });
  },
  getOrganizationSettings() {
    return request<OrganizationSettings>("/api/settings/organization");
  },
  updateOrganizationSettings(payload: Record<string, unknown>) {
    return request<OrganizationSettings>("/api/settings/organization", { method: "PATCH", body: JSON.stringify(payload) });
  },
  getSecuritySettings() {
    return request<{ session_timeout_minutes: number; require_mfa_for_admins: boolean }>("/api/settings/security");
  },
  getWorkflowSettings() {
    return request<{ duplicate_threshold: number; default_review_role: string; auto_expire_review_sessions_minutes: number }>("/api/settings/workflow");
  },
  acknowledgeCompliance(payload: { acknowledge_terms?: boolean; acknowledge_privacy?: boolean; acknowledge_hipaa?: boolean }) {
    return request<OrganizationSettings>("/api/settings/compliance/acknowledge", { method: "POST", body: JSON.stringify(payload) });
  },
  processFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<ReviewSession>("/api/files/process", { method: "POST", body: formData });
  },
  validateFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ is_valid: boolean; errors: string[] }>("/api/files/validate", { method: "POST", body: formData });
  },
  getReviewSession(sessionId: string) {
    return request<ReviewSession>(`/api/files/process/${sessionId}`);
  },
  updateReviewFlag(sessionId: string, flagId: string, status: string) {
    return request<ReviewSession>(`/api/files/process/${sessionId}/flags/${flagId}`, { method: "PATCH", body: JSON.stringify({ status }) });
  },
  discardReviewSession(sessionId: string) {
    return request<{ message: string }>(`/api/files/process/${sessionId}`, { method: "DELETE" });
  },
  getAggregateRuns() {
    return request<AggregateRun[]>("/api/reports/aggregate-runs");
  },
};
