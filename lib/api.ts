const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type Incident = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  people_affected: number;
  priority: string;
  risk_score: number;
  status: string;
  ai_suggested_category: string | null;
  ai_suggested_priority: string | null;
  ai_confidence: number | null;
  reported_by: number;
  created_at: string;
  updated_at: string | null;
};

export type StatusHistory = {
  id: number;
  incident_id: number;
  status: string;
  changed_by: number;
  changed_at: string;
};

export type AssignmentResponse = {
  assigned: boolean;
  team: {
    id: number;
    name: string;
  } | null;
  staff: {
    id: number;
    name: string;
    email: string | null;
  } | null;
  assigned_at?: string | null;
};

export type Assignment = {
  id: number;
  incident_id: number;
  team_id: number;
  staff_id: number;
  assigned_at: string;
};

export type Team = {
  id: number;
  name: string;
};

export type Staff = {
  id: number;
  name: string;
  email: string | null;
};

export type AnalyticsSummary = {
  total_incidents: number;
  open_incidents: number;
  critical_incidents: number;
  resolved_incidents: number;
  escalated_incidents: number;
  top_categories: {
    category: string;
    count: number;
  }[];
};

export type Notification = {
  id: number;
  user_id: number;
  incident_id: number | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("campus_token") ||
    sessionStorage.getItem("campus_token")
  );
}

function clearAuthAndRedirect() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("campus_token");
  sessionStorage.removeItem("campus_token");

  window.location.href = "/login";
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthAndRedirect();

    throw new ApiError(
      "Session expired. Please login again.",
      401,
    );
  }

  const contentType = response.headers.get("content-type");

  let data: unknown = null;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof data.detail === "string"
    ) {
      message = data.detail;
    }

    throw new ApiError(message, response.status);
  }

  return data as T;
}

/* ---------- Incidents ---------- */

export async function getIncidents(
  status?: string,
  category?: string,
): Promise<Incident[]> {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (category) {
    params.set("category", category);
  }

  const query = params.toString();

  return apiFetch<Incident[]>(
    `/incidents/${query ? `?${query}` : ""}`,
  );
}

export async function getIncident(
  incidentId: number,
): Promise<Incident> {
  const data = await apiFetch<Incident | { detail: string }>(
    `/incidents/${incidentId}`,
  );

  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data
  ) {
    throw new ApiError(data.detail, 404);
  }

  return data as Incident;
}

export async function getIncidentHistory(
  incidentId: number,
): Promise<StatusHistory[]> {
  return apiFetch<StatusHistory[]>(
    `/incidents/${incidentId}/history`,
  );
}

export async function getIncidentAssignment(
  incidentId: number,
): Promise<AssignmentResponse> {
  return apiFetch<AssignmentResponse>(
    `/incidents/${incidentId}/assignment`,
  );
}

/* ---------- Assignments ---------- */

export async function assignIncident(
  incidentId: number,
  teamId: number,
  staffId: number,
): Promise<Assignment> {
  const params = new URLSearchParams({
    team_id: String(teamId),
    staff_id: String(staffId),
  });

  return apiFetch<Assignment>(
    `/incidents/${incidentId}/assign?${params.toString()}`,
    {
      method: "POST",
    },
  );
}

/* ---------- Team & Staff Lookup ---------- */

export async function getTeams(): Promise<Team[]> {
  return apiFetch<Team[]>("/incidents/lookup/teams");
}

export async function getStaff(): Promise<Staff[]> {
  return apiFetch<Staff[]>("/incidents/lookup/staff");
}

/* ---------- Incident Status ---------- */

export async function updateIncidentStatus(
  incidentId: number,
  status: string,
): Promise<Incident> {
  const params = new URLSearchParams({
    new_status: status,
  });

  return apiFetch<Incident>(
    `/incidents/${incidentId}/status?${params.toString()}`,
    {
      method: "PATCH",
    },
  );
}

/* ---------- Analytics ---------- */

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>("/analytics/summary");
}

/* ---------- Notifications ---------- */

export async function getNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>("/notifications/");
}

export async function markNotificationRead(
  notificationId: number,
): Promise<Notification> {
  return apiFetch<Notification>(
    `/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    },
  );
}

export async function markAllNotificationsRead(): Promise<{
  message: string;
  count: number;
}> {
  return apiFetch<{
    message: string;
    count: number;
  }>("/notifications/read-all", {
    method: "PATCH",
  });
}