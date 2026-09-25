"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getIncident,
  getIncidentAssignment,
  getIncidentHistory,
  updateIncidentStatus,
  type Incident as ApiIncident,
  type AssignmentResponse,
  type StatusHistory,
} from "@/lib/api";

type IncidentStatus =
  | "Assigned"
  | "Acknowledged"
  | "In Progress"
  | "Resolved";

type Incident = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: IncidentStatus;
  reportedAt: string;
  peopleAffected: number;
  responseTeam: string;
  assignedStaff: string;
  aiConfidence: number | null;
  aiReason: string;
  slaTarget: string;
  slaStatus: "N/A";
};

const priorityStyles: Record<Incident["priority"], string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-slate-100 text-slate-700",
};

const statusStyles: Record<IncidentStatus, string> = {
  Assigned: "bg-blue-100 text-blue-700",
  Acknowledged: "bg-purple-100 text-purple-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  Resolved: "bg-green-100 text-green-700",
};

function formatStatus(status: string): IncidentStatus {
  switch (status?.toUpperCase()) {
    case "RESOLVED":
      return "Resolved";

    case "IN_PROGRESS":
      return "In Progress";

    case "ACKNOWLEDGED":
      return "Acknowledged";

    case "ASSIGNED":
    case "OPEN":
    default:
      return "Assigned";
  }
}

function formatPriority(priority: string): Incident["priority"] {
  switch (priority?.toUpperCase()) {
    case "CRITICAL":
      return "Critical";

    case "HIGH":
      return "High";

    case "LOW":
      return "Low";

    case "MEDIUM":
    default:
      return "Medium";
  }
}

function formatDate(dateString: string) {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function convertIncident(
  data: ApiIncident,
  assignment: AssignmentResponse
): Incident {
  return {
    id: `INC-${data.id}`,
    title: data.title,
    description: data.description,
    location: data.location,
    category: data.category,
    priority: formatPriority(data.priority),
    status: formatStatus(data.status),
    reportedAt: formatDate(data.created_at),
    peopleAffected: data.people_affected ?? 0,
    responseTeam: assignment.assigned
      ? assignment.team?.name || "Assigned Team"
      : "Unassigned",
    assignedStaff: assignment.assigned
      ? assignment.staff?.name || "Assigned Staff"
      : "Unassigned",
    aiConfidence:
      data.ai_confidence !== null && data.ai_confidence !== undefined
        ? data.ai_confidence
        : null,
    aiReason: "AI classification reason is not provided by the backend.",
    slaTarget: "N/A",
    slaStatus: "N/A",
  };
}

function getBackendStatus(status: IncidentStatus) {
  switch (status) {
    case "Acknowledged":
      return "ACKNOWLEDGED";

    case "In Progress":
      return "IN_PROGRESS";

    case "Resolved":
      return "RESOLVED";

    case "Assigned":
    default:
      return "ASSIGNED";
  }
}

function getTimelineLabel(status: string) {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return "Incident Reported";

    case "ASSIGNED":
      return "Response Team Assigned";

    case "ACKNOWLEDGED":
      return "Incident Acknowledged";

    case "IN_PROGRESS":
      return "Response Started";

    case "RESOLVED":
      return "Incident Resolved";

    default:
      return status;
  }
}

export default function StaffIncidentDetails() {
  const params = useParams();
  const incidentId = String(params.id);

const numericId = Number(
  incidentId.startsWith("INC-")
    ? incidentId.replace("INC-", "")
    : incidentId
);

  const [incident, setIncident] = useState<Incident | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [responseNote, setResponseNote] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  async function loadIncident() {
    try {
      setLoading(true);
      setError("");

      if (!Number.isFinite(numericId)) {
        throw new Error("Invalid incident ID.");
      }

      const [incidentData, assignmentData, historyData] =
        await Promise.all([
          getIncident(numericId),
          getIncidentAssignment(numericId),
          getIncidentHistory(numericId),
        ]);

      setIncident(convertIncident(incidentData, assignmentData));
      setHistory(
        [...historyData].sort(
          (a, b) =>
            new Date(a.changed_at).getTime() -
            new Date(b.changed_at).getTime()
        )
      );
    } catch (err) {
      console.error("Failed to load staff incident:", err);
      setError("Failed to load incident details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncident();
  }, [numericId]);

  const updateStatus = async (
    newStatus: IncidentStatus,
    successMessage: string
  ) => {
    try {
      setUpdating(true);
      setActionMessage("");

      await updateIncidentStatus(
        numericId,
        getBackendStatus(newStatus)
      );

      await loadIncident();

      setActionMessage(successMessage);
    } catch (err) {
      console.error("Failed to update incident status:", err);
      setActionMessage("Failed to update incident status.");
    } finally {
      setUpdating(false);
    }
  };

  const acknowledgeIncident = async () => {
    await updateStatus(
      "Acknowledged",
      "Incident acknowledged successfully."
    );
  };

  const startResponse = async () => {
    await updateStatus(
      "In Progress",
      "Response started. Incident is now in progress."
    );
  };

  const resolveIncident = async () => {
    if (!resolutionSummary.trim()) {
      setActionMessage(
        "Please enter a resolution summary before resolving."
      );
      return;
    }

    await updateStatus(
      "Resolved",
      "Incident resolved successfully."
    );
  };

  const timeline = useMemo(() => {
    return history.map((item) => ({
      title: getTimelineLabel(item.status),
      status: item.status,
      time: formatDate(item.changed_at),
    }));
  }, [history]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading incident details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !incident) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-600">
              {error || "Incident not found."}
            </p>

            <Link
              href="/staff/incidents"
              className="mt-4 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold !text-white"
            >
              Back to Incidents
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentStatus = incident.status;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 bg-slate-950 text-white md:flex md:flex-col">
          <div className="border-b border-slate-800 px-6 py-6">
            <h1 className="text-lg font-bold">Campus Response</h1>

            <p className="mt-1 text-xs text-slate-400">
              Response Staff Portal
            </p>
          </div>

          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">
                RS
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Response Staff
                </p>

                <p className="text-xs text-slate-400">
                  Assigned Team
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-5">
            <Link
              href="/staff"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/staff/incidents"
              className="block rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
            >
              Assigned Incidents
            </Link>

            <Link
              href="/staff/notifications"
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <span>Notifications</span>
            </Link>
          </nav>

          <div className="border-t border-slate-800 px-5 py-5">
            <Link
              href="/login"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Logout
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1">
          {/* Mobile Header */}
          <header className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-bold">
                  Campus Response
                </h1>

                <p className="text-xs text-slate-500">
                  Response Staff Portal
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                RS
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Link
                href="/staff"
                className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700"
              >
                Dashboard
              </Link>

              <Link
                href="/staff/incidents"
                className="rounded-lg bg-slate-950 px-3 py-2 text-center text-xs font-semibold !text-white"
              >
                Incidents
              </Link>

              <Link
                href="/staff/notifications"
                className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700"
              >
                Alerts
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {/* Back */}
            <Link
              href="/staff/incidents"
              className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
            >
              ← Back to Assigned Incidents
            </Link>

            {/* Header */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {incident.id}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[incident.priority]}`}
                    >
                      {incident.priority}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[incident.status]}`}
                    >
                      {incident.status}
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                    {incident.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Reported {incident.reportedAt}
                  </p>
                </div>

                <span className="self-start rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                  SLA: N/A
                </span>
              </div>
            </div>

            {/* Incident Information */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 sm:p-6">
                <h3 className="text-lg font-bold">
                  Incident Information
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {incident.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {incident.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      People Affected
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {incident.peopleAffected}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Response Team
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {incident.responseTeam}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Assigned Staff
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {incident.assignedStaff}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      SLA Target
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      N/A
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {incident.description}
                  </p>
                </div>
              </div>

              {/* Assignment */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-lg font-bold">
                  Assignment
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Team
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {incident.responseTeam}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Assigned To
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {incident.assignedStaff}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-4">
                    <p className="text-xs text-slate-500">
                      SLA Status
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      N/A
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Classification */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    AI Classification
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    AI-assisted classification information from the
                    incident record.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Confidence
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {incident.aiConfidence !== null
                      ? `${incident.aiConfidence}%`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 font-semibold">
                    {incident.category}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Priority
                  </p>

                  <p className="mt-1 font-semibold">
                    {incident.priority}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  AI Reason
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {incident.aiReason}
                </p>
              </div>
            </div>

            {/* Response Actions */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div>
                <h3 className="text-lg font-bold">
                  Response Actions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update the incident as you respond to it.
                </p>
              </div>

              {actionMessage && (
                <div
                  className={`mt-5 rounded-xl border p-4 text-sm ${
                    actionMessage.includes("successfully") ||
                    actionMessage.includes("started")
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {actionMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={acknowledgeIncident}
                  disabled={
                    updating ||
                    currentStatus === "Acknowledged" ||
                    currentStatus === "In Progress" ||
                    currentStatus === "Resolved"
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {updating ? "Updating..." : "Acknowledge"}
                </button>

                <button
                  type="button"
                  onClick={startResponse}
                  disabled={
                    updating ||
                    currentStatus === "In Progress" ||
                    currentStatus === "Resolved"
                  }
                  className="rounded-xl bg-black px-4 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {updating ? "Updating..." : "Start Response"}
                </button>

                <button
                  type="button"
                  onClick={resolveIncident}
                  disabled={updating || currentStatus === "Resolved"}
                  className="rounded-xl border border-green-600 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {updating ? "Updating..." : "Mark Resolved"}
                </button>
              </div>

              {/* Response Note */}
              <div className="mt-6">
                <label className="text-sm font-semibold">
                  Response Note
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Add information about the action you are taking.
                </p>

                <textarea
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="Example: Reached Block B and isolated the affected water line..."
                  rows={4}
                  className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Note: response notes are currently not persisted because
                  the backend does not provide a response-note endpoint.
                </p>
              </div>

              {/* Resolution Summary */}
              {status !== "Resolved" && (
                <div className="mt-5">
                  <label className="text-sm font-semibold">
                    Resolution Summary
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    Required when marking the incident as resolved.
                  </p>

                  <textarea
                    value={resolutionSummary}
                    onChange={(e) =>
                      setResolutionSummary(e.target.value)
                    }
                    placeholder="Example: Leakage was repaired and the area was checked for safety."
                    rows={4}
                    className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    The current backend records the status change but does
                    not provide a field to persist this summary.
                  </p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold">
                Incident Timeline
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Track the actual status history of this incident.
              </p>

              <div className="mt-6 space-y-5">
                {timeline.length === 0 && (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No status history is available.
                  </div>
                )}

                {timeline.map((item, index) => (
                  <div
                    key={`${item.status}-${item.time}-${index}`}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                        ✓
                      </div>

                      {index < timeline.length - 1 && (
                        <div className="mt-2 h-8 w-px bg-black" />
                      )}
                    </div>

                    <div className="pt-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Link
                href="/staff/incidents"
                className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                ← Back to Incidents
              </Link>

              <Link
                href="/staff"
                className="rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                Staff Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

