"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  assignIncident,
  getIncident,
  getIncidentAssignment,
  getIncidentHistory,
  getStaff,
  getTeams,
  updateIncidentStatus,
  type Incident as ApiIncident,
  type StatusHistory,
  type Staff,
  type Team,
} from "@/lib/api";

type Incident = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
  status: string;
  reportedAt: string;
  peopleAffected: number;
  responseTeam: string;
  assignedStaff: string;
  assignmentStatus: string;
  aiConfidence: number;
  aiReason: string;
  slaTarget: string;
  slaStatus: string;
};

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-slate-100 text-slate-700",
};

const statusStyles: Record<string, string> = {
  Open: "bg-blue-100 text-blue-700",
  Acknowledged: "bg-purple-100 text-purple-700",
  Assigned: "bg-indigo-100 text-indigo-700",
  "In Progress": "bg-orange-100 text-orange-700",
  Resolved: "bg-green-100 text-green-700",
};

const timelineSteps = [
  "Incident Reported",
  "AI Classified",
  "Coordinator Reviewed",
  "Response Team Assigned",
  "Response Started",
  "Incident Resolved",
];

function mapStatus(status: string) {
  switch (status) {
    case "OPEN":
      return "Open";
    case "ASSIGNED":
      return "Assigned";
    case "RESOLVED":
      return "Resolved";
    case "ACKNOWLEDGED":
      return "Acknowledged";
    case "IN_PROGRESS":
      return "In Progress";
    default:
      return status;
  }
}

function formatReportedTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function convertIncident(
  incident: ApiIncident,
  assignmentTeam: string,
  assignmentStaff: string,
  assignmentStatus: string,
): Incident {
  return {
    id: `INC-${incident.id}`,
    title: incident.title,
    description: incident.description,
    location: incident.location,
    category: incident.category,
    priority: incident.priority,
    status: mapStatus(incident.status),
    reportedAt: formatReportedTime(incident.created_at),
    peopleAffected: incident.people_affected,
    responseTeam: assignmentTeam,
    assignedStaff: assignmentStaff,
    assignmentStatus,
    aiConfidence: incident.ai_confidence ?? 0,
    aiReason: "AI reason is not currently provided by the backend.",
    slaTarget: "N/A",
    slaStatus: "N/A",
  };
}

function getCompletedSteps(
  status: string,
  history: StatusHistory[],
) {
  let completed = 2;

  const statuses = history.map((item) => item.status);

  if (
    statuses.includes("ASSIGNED") ||
    status === "Assigned" ||
    status === "In Progress" ||
    status === "Resolved"
  ) {
    completed = 4;
  }

  if (
    status === "In Progress" ||
    status === "Resolved"
  ) {
    completed = 5;
  }

  if (status === "Resolved") {
    completed = 6;
  }

  return completed;
}

export default function CoordinatorIncidentDetailsPage() {
  const params = useParams();
  const id = String(params.id);
  const numericId = Number(id.replace("INC-", ""));

  const [incident, setIncident] = useState<Incident | null>(null);
  const [apiIncident, setApiIncident] =
    useState<ApiIncident | null>(null);

  const [history, setHistory] = useState<StatusHistory[]>([]);

  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const [reviewed, setReviewed] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const [responseTeam, setResponseTeam] =
    useState("Not Assigned");

  const [assignedStaff, setAssignedStaff] =
    useState("Not Assigned");

  const [assignmentStatus, setAssignmentStatus] =
    useState("Pending");

  /* ---------- Assignment State ---------- */

  const [teams, setTeams] = useState<Team[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [selectedTeamId, setSelectedTeamId] =
    useState("");

  const [selectedStaffId, setSelectedStaffId] =
    useState("");

  const [assignmentLoading, setAssignmentLoading] =
    useState(false);

  const [assignmentMessage, setAssignmentMessage] =
    useState("");

  /* ---------- General State ---------- */

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusUpdating, setStatusUpdating] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  useEffect(() => {
    async function loadIncident() {
      try {
        setLoading(true);
        setError("");

        if (!Number.isFinite(numericId)) {
          throw new Error("Invalid incident ID.");
        }

        const [
          incidentData,
          assignmentData,
          historyData,
          teamsData,
          staffData,
        ] = await Promise.all([
          getIncident(numericId),
          getIncidentAssignment(numericId),
          getIncidentHistory(numericId),
          getTeams(),
          getStaff(),
        ]);

        setApiIncident(incidentData);
        setHistory(historyData);

        setTeams(teamsData);
        setStaff(staffData);

        const teamName =
          assignmentData.assigned && assignmentData.team
            ? assignmentData.team.name
            : "Not Assigned";

        const staffName =
          assignmentData.assigned && assignmentData.staff
            ? assignmentData.staff.name
            : "Not Assigned";

        const currentAssignmentStatus =
          assignmentData.assigned
            ? "Assigned"
            : "Pending";

        const converted = convertIncident(
          incidentData,
          teamName,
          staffName,
          currentAssignmentStatus,
        );

        setIncident(converted);

        setCategory(incidentData.category);
        setPriority(incidentData.priority);

        setResponseTeam(teamName);
        setAssignedStaff(staffName);
        setAssignmentStatus(currentAssignmentStatus);

        /* Select currently assigned team/staff */
        if (
          assignmentData.assigned &&
          assignmentData.team
        ) {
          setSelectedTeamId(
            String(assignmentData.team.id),
          );
        } else {
          setSelectedTeamId("");
        }

        if (
          assignmentData.assigned &&
          assignmentData.staff
        ) {
          setSelectedStaffId(
            String(assignmentData.staff.id),
          );
        } else {
          setSelectedStaffId("");
        }
      } catch (err) {
        console.error("Failed to load incident:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load incident.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadIncident();
  }, [numericId]);

  /* ---------- Refresh Assignment ---------- */

  const refreshAssignment = async () => {
    if (!apiIncident) {
      return;
    }

    const [
      updatedIncident,
      assignmentData,
      updatedHistory,
    ] = await Promise.all([
      getIncident(apiIncident.id),
      getIncidentAssignment(apiIncident.id),
      getIncidentHistory(apiIncident.id),
    ]);

    setApiIncident(updatedIncident);
    setHistory(updatedHistory);

    const teamName =
      assignmentData.assigned && assignmentData.team
        ? assignmentData.team.name
        : "Not Assigned";

    const staffName =
      assignmentData.assigned && assignmentData.staff
        ? assignmentData.staff.name
        : "Not Assigned";

    const currentAssignmentStatus =
      assignmentData.assigned
        ? "Assigned"
        : "Pending";

    const converted = convertIncident(
      updatedIncident,
      teamName,
      staffName,
      currentAssignmentStatus,
    );

    setIncident(converted);

    setResponseTeam(teamName);
    setAssignedStaff(staffName);
    setAssignmentStatus(currentAssignmentStatus);

    if (
      assignmentData.assigned &&
      assignmentData.team
    ) {
      setSelectedTeamId(
        String(assignmentData.team.id),
      );
    }

    if (
      assignmentData.assigned &&
      assignmentData.staff
    ) {
      setSelectedStaffId(
        String(assignmentData.staff.id),
      );
    }
  };

  /* ---------- Assign Incident ---------- */

  const handleAssignIncident = async () => {
    if (!apiIncident) {
      return;
    }

    if (!selectedTeamId) {
      setAssignmentMessage(
        "Please select a response team.",
      );
      return;
    }

    if (!selectedStaffId) {
      setAssignmentMessage(
        "Please select a staff member.",
      );
      return;
    }

    try {
      setAssignmentLoading(true);
      setAssignmentMessage("");

      await assignIncident(
        apiIncident.id,
        Number(selectedTeamId),
        Number(selectedStaffId),
      );

      await refreshAssignment();

      setAssignmentMessage(
        "Incident assigned successfully.",
      );
    } catch (err) {
      console.error(
        "Failed to assign incident:",
        err,
      );

      setAssignmentMessage(
        err instanceof Error
          ? err.message
          : "Unable to assign incident.",
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  /* ---------- AI Review ---------- */

  const handleAccept = () => {
    if (!incident) {
      return;
    }

    setCategory(incident.category);
    setPriority(incident.priority);
    setReviewed(true);
    setReviewNote(
      "AI classification accepted by coordinator.",
    );
  };

  const handleSaveReview = () => {
    setReviewed(true);

    if (!reviewNote.trim()) {
      setReviewNote(
        "Classification reviewed manually by coordinator.",
      );
    }
  };

  /* ---------- Status ---------- */

  const handleStatusChange = async (
    newStatus: string,
  ) => {
    if (!apiIncident) {
      return;
    }

    try {
      setStatusUpdating(true);
      setStatusMessage("");

      const updated = await updateIncidentStatus(
        apiIncident.id,
        newStatus,
      );

      setApiIncident(updated);

      const updatedStatus = mapStatus(updated.status);

      setIncident((current) =>
        current
          ? {
              ...current,
              status: updatedStatus,
            }
          : current,
      );

      const updatedHistory =
        await getIncidentHistory(apiIncident.id);

      setHistory(updatedHistory);

      setStatusMessage(
        `Incident status updated to ${updatedStatus}.`,
      );
    } catch (err) {
      console.error(
        "Failed to update incident status:",
        err,
      );

      setStatusMessage(
        err instanceof Error
          ? err.message
          : "Unable to update incident status.",
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const completedSteps = useMemo(() => {
    if (!incident) {
      return 2;
    }

    return getCompletedSteps(
      incident.status,
      history,
    );
  }, [incident, history]);

  /* ---------- Loading ---------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <aside className="w-64 bg-slate-950 px-4 py-6 text-white">
            <div className="mb-8 px-3">
              <h1 className="text-xl font-bold">
                CampusSafe
              </h1>

              <p className="mt-1 text-xs text-slate-400">
                Incident Management Platform
              </p>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-8 py-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h2 className="text-xl font-bold">
                  Loading incident...
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Fetching incident information from the backend.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <aside className="w-64 bg-slate-950 px-4 py-6 text-white">
            <div className="mb-8 px-3">
              <h1 className="text-xl font-bold">
                CampusSafe
              </h1>

              <p className="mt-1 text-xs text-slate-400">
                Incident Management Platform
              </p>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-8 py-8">
              <Link
                href="/coordinator/incidents"
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                ← Back to All Incidents
              </Link>

              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8">
                <h2 className="text-xl font-bold text-red-800">
                  Unable to load incident
                </h2>

                <p className="mt-2 text-sm text-red-700">
                  {error || "Incident not found."}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ---------- Main UI ---------- */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}

        <aside className="w-64 bg-slate-950 px-4 py-6 text-white">
          <div className="mb-8 px-3">
            <h1 className="text-xl font-bold">
              CampusSafe
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Incident Management Platform
            </p>
          </div>

          <div className="mb-6 rounded-xl bg-slate-900 px-4 py-3">
            <p className="text-xs text-slate-400">
              Logged in as
            </p>

            <p className="mt-1 text-sm font-semibold">
              Coordinator
            </p>

            <p className="mt-1 text-xs text-slate-500">
              coordinator@college.edu
            </p>
          </div>

          <nav className="space-y-2">
            <Link
              href="/coordinator"
              className="flex items-center rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/coordinator/incidents"
              className="flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
            >
              All Incidents
            </Link>

            <Link
              href="/coordinator/analytics"
              className="flex items-center rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Analytics
            </Link>

            <Link
              href="/coordinator/notifications"
              className="flex items-center rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Notifications
            </Link>
          </nav>
        </aside>

        {/* Main */}

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-8 py-8">

            {/* Header */}

            <div className="mb-8 flex items-center justify-between">
              <div>
                <Link
                  href="/coordinator/incidents"
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  ← Back to All Incidents
                </Link>

                <div className="mt-4 flex items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {incident.id}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      priorityStyles[priority] ??
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {priority}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[incident.status] ??
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>

                <p className="mt-2 text-slate-500">
                  Coordinator review and incident management
                </p>
              </div>
            </div>

            {/* Incident Overview */}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold">
                  Incident Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Key information reported by the student.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Incident
                  </p>

                  <p className="mt-1 font-semibold">
                    {incident.title}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 font-semibold">
                    {incident.location}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 font-semibold">
                    {category}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    People Affected
                  </p>

                  <p className="mt-1 font-semibold">
                    {incident.peopleAffected}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Reported
                  </p>

                  <p className="mt-1 font-semibold">
                    {incident.reportedAt}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Response Team
                  </p>

                  <p className="mt-1 font-semibold">
                    {responseTeam}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Assigned Staff
                  </p>

                  <p className="mt-1 font-semibold">
                    {assignedStaff}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    SLA
                  </p>

                  <p className="mt-1 font-semibold">
                    {incident.slaTarget} · {incident.slaStatus}
                  </p>
                </div>
              </div>
            </section>

            {/* Description */}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold">
                Incident Description
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {incident.description}
              </p>
            </section>

            {/* AI Classification */}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold">
                  AI Classification Review
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Review the AI recommendation before confirming
                  the incident classification.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Confidence
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {incident.aiConfidence > 0
                      ? `${incident.aiConfidence}%`
                      : "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Suggested Category
                  </p>

                  <p className="mt-2 font-bold">
                    {incident.category}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Suggested Priority
                  </p>

                  <p className="mt-2 font-bold">
                    {incident.priority}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    SLA Target
                  </p>

                  <p className="mt-2 font-bold">
                    {incident.slaTarget}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold">
                  AI Reason
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {incident.aiReason}
                </p>
              </div>

              <button
                onClick={handleAccept}
                className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                Accept AI Classification
              </button>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <h4 className="font-semibold">
                  Coordinator Decision
                </h4>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Category
                    </label>

                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option>Security</option>
                      <option>Medical</option>
                      <option>Electrical</option>
                      <option>Maintenance</option>
                      <option>Water</option>
                      <option>IT</option>
                      <option>Infrastructure</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Priority
                    </label>

                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option>Critical</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">
                    Review Note
                  </label>

                  <textarea
                    value={reviewNote}
                    onChange={(e) =>
                      setReviewNote(e.target.value)
                    }
                    rows={3}
                    placeholder="Add a coordinator review note..."
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <button
                  onClick={handleSaveReview}
                  className="mt-4 rounded-xl bg-black px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
                >
                  Save Coordinator Review
                </button>

                {reviewed && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="font-semibold text-green-800">
                      Classification reviewed successfully
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      Final classification: {category} ·{" "}
                      {priority}
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      {reviewNote}
                    </p>

                    <p className="mt-2 text-xs text-green-700">
                      Note: this review is currently only held
                      in the page because the backend does not
                      yet have a coordinator-review endpoint.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                AI classification is advisory. The coordinator
                remains responsible for the final category and
                priority decision.
              </div>
            </section>

            {/* Incident Assignment */}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold">
                  Incident Assignment
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Assign a response team and staff member to
                  this incident.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">

                {/* Team */}

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Response Team
                  </label>

                  <select
                    value={selectedTeamId}
                    onChange={(e) =>
                      setSelectedTeamId(e.target.value)
                    }
                    disabled={assignmentLoading}
                    className="mt-2 h-[46px] w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold outline-none focus:border-slate-500 disabled:bg-slate-100"
                  >
                    <option value="">
                      Select Response Team
                    </option>

                    {teams.map((team) => (
                      <option
                        key={team.id}
                        value={team.id}
                      >
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff */}

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Assign Staff Member
                  </label>

                  <select
                    value={selectedStaffId}
                    onChange={(e) =>
                      setSelectedStaffId(e.target.value)
                    }
                    disabled={assignmentLoading}
                    className="mt-2 h-[46px] w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold outline-none focus:border-slate-500 disabled:bg-slate-100"
                  >
                    <option value="">
                      Select Staff Member
                    </option>

                    {staff.map((member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignment Status */}

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Assignment Status
                  </label>

                  <div className="mt-2 flex h-[46px] items-center rounded-xl bg-slate-50 px-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        assignmentStatus === "Assigned"
                          ? "bg-green-100 text-green-700"
                          : assignmentStatus === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {assignmentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment Summary */}

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  <div>
                    <span className="text-slate-500">
                      Team:{" "}
                    </span>

                    <span className="font-semibold">
                      {responseTeam}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">
                      Staff:{" "}
                    </span>

                    <span className="font-semibold">
                      {assignedStaff}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">
                      Status:{" "}
                    </span>

                    <span className="font-semibold">
                      {assignmentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assign Button */}

              <button
                onClick={handleAssignIncident}
                disabled={
                  assignmentLoading ||
                  teams.length === 0 ||
                  staff.length === 0
                }
                className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assignmentLoading
                  ? "Assigning..."
                  : "Assign Incident"}
              </button>

              {/* Assignment Message */}

              {assignmentMessage && (
                <div
                  className={`mt-4 rounded-xl p-4 text-sm font-medium ${
                    assignmentMessage.includes(
                      "successfully",
                    )
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {assignmentMessage}
                </div>
              )}

              {/* No data message */}

              {teams.length === 0 && (
                <div className="mt-5 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
                  No response teams are currently available
                  in the backend.
                </div>
              )}

              {staff.length === 0 && (
                <div className="mt-5 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
                  No staff members are currently available
                  in the backend.
                </div>
              )}
            </section>

            {/* Status Management */}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold">
                  Incident Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update the incident status using the backend.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  disabled={statusUpdating}
                  onClick={() =>
                    handleStatusChange("OPEN")
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Open
                </button>

                <button
                  disabled={statusUpdating}
                  onClick={() =>
                    handleStatusChange("ASSIGNED")
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Assigned
                </button>

                <button
                  disabled={statusUpdating}
                  onClick={() =>
                    handleStatusChange("RESOLVED")
                  }
                  className="rounded-xl bg-black px-4 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Resolve Incident
                </button>
              </div>

              {statusMessage && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700">
                  {statusMessage}
                </div>
              )}
            </section>

            {/* Timeline */}

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold">
                  Incident Timeline
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Complete lifecycle of this incident.
                </p>
              </div>

              <div className="space-y-5">
                {timelineSteps.map((step, index) => {
                  const completed =
                    index < completedSteps;

                  return (
                    <div
                      key={step}
                      className="flex items-start gap-4"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          completed
                            ? "bg-black !text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {completed ? "✓" : index + 1}
                      </div>

                      <div className="pt-1">
                        <p
                          className={`font-semibold ${
                            completed
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step}
                        </p>

                        {completed && (
                          <p className="mt-1 text-xs text-slate-500">
                            Completed
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {history.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h4 className="font-semibold">
                    Backend Status History
                  </h4>

                  <div className="mt-4 space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl bg-slate-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold">
                            {mapStatus(item.status)}
                          </span>

                          <span className="text-xs text-slate-500">
                            {formatReportedTime(
                              item.changed_at,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Changed by user ID:{" "}
                          {item.changed_by}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Bottom Navigation */}

            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <Link
                href="/coordinator/incidents"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                ← All Incidents
              </Link>

              <Link
                href="/coordinator/notifications"
                className="rounded-xl bg-black px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                View Notifications →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}