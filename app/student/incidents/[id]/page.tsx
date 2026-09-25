"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Incident = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Acknowledged" | "Assigned" | "In Progress" | "Resolved";
  reportedAt: string;
  peopleAffected: string;
  responseTeam: string;
  aiConfidence: string;
  aiSuggestedCategory: string;
  aiSuggestedPriority: "Critical" | "High" | "Medium" | "Low";
  aiReason: string;
  slaTarget: string;
  slaStatus: string;
};

export default function IncidentDetailsPage() {
const params = useParams();
const id = String(params.id);
const numericId = id.replace("INC-", "");

const [incident, setIncident] = useState<Incident | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [assignment, setAssignment] = useState<{
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
}>({
  assigned: false,
  team: null,
  staff: null,
});

const [timeline, setTimeline] = useState<
  {
    id: number;
    status: string;
    changed_at: string;
    changed_by: number;
  }[]
>([]);

  useEffect(() => {
  const token =
    localStorage.getItem("campus_token") ||
    sessionStorage.getItem("campus_token");

  if (!token) {
    setLoading(false);
    return;
  }

  fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/incidents/${id.replace("INC-", "")}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
  const responseText = await response.text();

  console.log(
    "Assignment API response:",
    response.status,
    responseText
  );

  if (!response.ok) {
    throw new Error(
      `Assignment API failed with status ${response.status}`
    );
  }

  return JSON.parse(responseText);
})
    .then((data) => {
  setIncident({
    id: `INC-${data.id}`,

    title: data.title,

    description: data.description,

    location: data.location,

    category: data.category,

    priority: data.priority
      ? data.priority.charAt(0).toUpperCase() +
        data.priority.slice(1).toLowerCase()
      : "Medium",

    status: formatStatus(data.status),

    reportedAt: data.created_at
      ? new Date(data.created_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Pending",

    peopleAffected:
      data.people_affected > 0
        ? String(data.people_affected)
        : "No",

    responseTeam: "Awaiting assignment",

    aiConfidence:
      data.ai_confidence !== null &&
      data.ai_confidence !== undefined
        ? `${Math.round(data.ai_confidence * 100)}%`
        : "Pending",

    aiSuggestedCategory:
      data.ai_suggested_category || data.category || "Other",

    aiSuggestedPriority:
      data.ai_suggested_priority
        ? data.ai_suggested_priority.charAt(0).toUpperCase() +
          data.ai_suggested_priority.slice(1).toLowerCase()
        : "Medium",

    aiReason:
      "The system analyzed the incident and generated an initial classification.",

    slaTarget: "30 minutes",

    slaStatus: "Awaiting classification",
  });
})
    .catch((error) => {
  console.error("Failed to load incident:", error);
  setError("Unable to load incident details.");
})
    .finally(() => {
      setLoading(false);
    });
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents/${numericId}/assignment`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch assignment");
      }

      return response.json();
    })
    .then((data) => {
  setAssignment(data);

  setIncident((currentIncident) => {
    if (!currentIncident) {
      return currentIncident;
    }

    return {
      ...currentIncident,
      responseTeam:
        data.assigned && data.team
          ? data.team.name
          : "Awaiting assignment",
    };
  });
})
    .catch((error) => {
      console.error("Failed to load assignment:", error);
    });
    fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/incidents/${numericId}/history`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
)
  .then(async (response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch incident history");
    }

    return response.json();
  })
  .then((data) => {
    setTimeline(data);
  })
  .catch((error) => {
    console.error("Failed to load incident history:", error);
  });
}, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading incident...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-red-700">
            Unable to load incident
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {error || "Incident not found."}
          </p>

          <Link
            href="/student/incidents"
            className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            Back to My Incidents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col bg-slate-950 text-white md:flex">
          <div className="border-b border-slate-800 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold">
                CI
              </div>

              <div>
                <h1 className="font-semibold">Campus Incident</h1>
                <p className="text-xs text-slate-400">
                  Response Platform
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Student Portal
            </p>

            <div className="space-y-2">
              <Link
                href="/student"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                <span>⌂</span>
                Dashboard
              </Link>

              <Link
                href="/student/report"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                <span>＋</span>
                Report Incident
              </Link>

              <Link
                href="/student/incidents"
                className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium"
              >
                <span>▤</span>
                My Incidents
              </Link>

              <Link
                href="/student/notifications"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                <span>◉</span>
                Notifications
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs">
                  3
                </span>
              </Link>
            </div>
          </nav>

          <div className="border-t border-slate-800 p-4">
            <Link
              href="/login"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              <span>↪</span>
              Sign Out
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-6 py-5 lg:px-8">
              <div>
                <p className="text-sm text-slate-500">Student Portal</p>
                <h2 className="text-2xl font-bold tracking-tight">
                  Incident Details
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/student/notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                >
                  🔔
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                </Link>

                <div className="hidden items-center gap-3 sm:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    ST
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Student</p>
                    <p className="text-xs text-slate-500">
                      student@college.edu.in
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-6 lg:p-8">
            {/* Back */}
            <Link
              href="/student/incidents"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
            >
              ← Back to My Incidents
            </Link>

            {/* Incident header */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6 lg:p-8">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        {incident.id}
                      </span>

                      <StatusBadge status={incident.status} />

                      <PriorityBadge priority={incident.aiSuggestedPriority} />
                    </div>

                    <h3 className="mt-5 text-2xl font-bold tracking-tight lg:text-3xl">
                      {incident.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Reported on {incident.reportedAt}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Current Status
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {incident.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-4 lg:p-8">
                <InfoItem
                  label="Category"
                  value={incident.aiSuggestedCategory}
                  icon="▤"
                />

                <InfoItem
                  label="Location"
                  value={incident.location}
                  icon="⌖"
                />

                <InfoItem
                  label="People Affected"
                  value={incident.peopleAffected}
                  icon="♙"
                />

                <InfoItem
                  label="Response Team"
                  value={incident.responseTeam}
                  icon="⚕"
                />
              </div>
            </section>

            {/* Description + SLA */}
            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <h4 className="text-lg font-bold">Incident Description</h4>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {incident.description}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="text-lg font-bold">SLA Status</h4>

                <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Target Response
                  </p>

                  <p className="mt-1 text-2xl font-bold text-emerald-800">
                    {incident.slaTarget}
                  </p>

                  <p className="mt-2 text-sm font-medium text-emerald-700">
                    {incident.slaStatus}
                  </p>
                </div>
              </div>
            </section>

            {/* AI Classification */}
            <section className="rounded-2xl border border-blue-200 bg-blue-50 shadow-sm">
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                    AI
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h4 className="text-lg font-bold text-blue-950">
                          AI Classification
                        </h4>

                        <p className="mt-1 text-sm text-blue-800">
                          Initial classification generated by the incident
                          analysis system.
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700">
                        Confidence: {incident.aiConfidence}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Suggested Category
                        </p>

                        <p className="mt-2 font-semibold text-slate-800">
                          {incident.aiSuggestedCategory}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Suggested Priority
                        </p>

                        <div className="mt-2">
                          <PriorityBadge priority={incident.aiSuggestedPriority} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        AI Reason
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {incident.aiReason}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                        ✓
                      </span>
                      Classification will be reviewed by a campus coordinator.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <h4 className="text-lg font-bold">Incident Timeline</h4>

                <p className="mt-1 text-sm text-slate-500">
                  Track every important stage of your incident.
                </p>
              </div>

              <div className="p-6 lg:p-8">
                <IncidentTimeline timeline={timeline} />
              </div>
            </section>

            {/* Important information */}
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  !
                </div>

                <div>
                  <h4 className="font-semibold text-amber-900">
                    What happens next?
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    The coordinator reviews the incident classification,
                    confirms its priority, and assigns the appropriate
                    response team. You will receive notifications whenever
                    there is a significant update.
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Link
                href="/student/incidents"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ← Back to My Incidents
              </Link>

              <Link
                href="/student/report"
                className="rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                + Report Another Incident
              </Link>
            </div>

            <footer className="pb-2 text-center text-xs text-slate-400">
              Campus Incident Management & Emergency Response Platform
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Timeline ---------- */

function IncidentTimeline({
  timeline,
}: {
  timeline: {
    id: number;
    status: string;
    changed_at: string;
    changed_by: number;
  }[];
}) {
  const getTimelineTitle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return "Incident Reported";

      case "ASSIGNED":
        return "Response Team Assigned";

      case "RESOLVED":
        return "Incident Resolved";

      default:
        return "Incident Status Updated";
    }
  };

  const getTimelineDescription = (status: string) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return "The incident was submitted by the student.";

      case "ASSIGNED":
        return "A response team was assigned to the incident.";

      case "RESOLVED":
        return "The incident was resolved by the response team.";

      default:
        return "The incident status was updated.";
    }
  };

  const sortedTimeline = [...timeline].sort(
    (a, b) =>
      new Date(a.changed_at).getTime() -
      new Date(b.changed_at).getTime()
  );

  if (sortedTimeline.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-500">
          No timeline updates available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {sortedTimeline.map((item, index) => {
        const isLast = index === sortedTimeline.length - 1;

        return (
          <div
            key={item.id}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast && (
              <div className="absolute left-4 top-9 h-[calc(100%-20px)] w-0.5 bg-blue-500" />
            )}

            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-xs font-bold text-white ring-4 ring-blue-50">
              ✓
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                <div>
                  <h5 className="text-sm font-bold text-slate-900">
                    {getTimelineTitle(item.status)}
                  </h5>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {getTimelineDescription(item.status)}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-slate-400">
                  {item.changed_at
                    ? new Date(item.changed_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatStatus(status: string): Incident["status"] {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return "Open";

    case "ACKNOWLEDGED":
      return "Acknowledged";

    case "ASSIGNED":
      return "Assigned";

    case "IN_PROGRESS":
      return "In Progress";

    case "RESOLVED":
      return "Resolved";

    default:
      return "Open";
  }
}

function getCompletedSteps(status: Incident["status"]) {
  switch (status) {
    case "Open":
      return 2;

    case "Acknowledged":
      return 3;

    case "Assigned":
      return 4;

    case "In Progress":
      return 5;

    case "Resolved":
      return 6;

    default:
      return 1;
  }
}

/* ---------- UI Components ---------- */

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Incident["priority"];
}) {
  const styles = {
    Critical: "bg-red-50 text-red-700 border-red-200",
    High: "bg-orange-50 text-orange-700 border-orange-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: Incident["status"];
}) {
  const styles = {
    Open: "bg-blue-50 text-blue-700",
    Acknowledged: "bg-violet-50 text-violet-700",
    Assigned: "bg-indigo-50 text-indigo-700",
    "In Progress": "bg-orange-50 text-orange-700",
    Resolved: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}