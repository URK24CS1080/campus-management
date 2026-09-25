"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getIncidents,
  getIncidentAssignment,
  type Incident as ApiIncident,
} from "@/lib/api";

type Incident = {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Acknowledged" | "Assigned" | "In Progress" | "Resolved";
  team: string;
  sla: "At Risk" | "Within SLA" | "SLA Met" | "N/A";
  reported: string;
};

const priorityStyle = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusStyle = {
  Open: "bg-slate-100 text-slate-700",
  Acknowledged: "bg-blue-100 text-blue-700",
  Assigned: "bg-purple-100 text-purple-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  Resolved: "bg-green-100 text-green-700",
};

const slaStyle = {
  "At Risk": "bg-red-100 text-red-700",
  "Within SLA": "bg-blue-100 text-blue-700",
  "SLA Met": "bg-green-100 text-green-700",
  "N/A": "bg-slate-100 text-slate-500",
};

function mapStatus(status: string): Incident["status"] {
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
      return status as Incident["status"];
  }
}

function mapPriority(priority: string): Incident["priority"] {
  switch (priority) {
    case "Critical":
      return "Critical";
    case "High":
      return "High";
    case "Medium":
      return "Medium";
    case "Low":
      return "Low";
    default:
      return "Medium";
  }
}

function formatReportedTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const diff = Date.now() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  return `${days} days ago`;
}

function convertIncident(
  incident: ApiIncident,
  teamName: string,
): Incident {
  return {
    id: `INC-${incident.id}`,
    title: incident.title,
    category: incident.category,
    location: incident.location,
    priority: mapPriority(incident.priority),
    status: mapStatus(incident.status),
    team: teamName,
    sla: "N/A",
    reported: formatReportedTime(incident.created_at),
  };
}

export default function CoordinatorIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIncidents() {
      try {
        setLoading(true);
        setError("");

        const data = await getIncidents();

        const mapped = await Promise.all(
          data.map(async (incident) => {
            try {
              const assignment = await getIncidentAssignment(incident.id);

              const teamName =
                assignment.assigned && assignment.team
                  ? assignment.team.name
                  : "Unassigned";

              return convertIncident(incident, teamName);
            } catch {
              return convertIncident(incident, "Unassigned");
            }
          }),
        );

        setIncidents(mapped);
      } catch (err) {
        console.error("Failed to load incidents:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load incidents",
        );
      } finally {
        setLoading(false);
      }
    }

    loadIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        incident.id.toLowerCase().includes(search.toLowerCase()) ||
        incident.title.toLowerCase().includes(search.toLowerCase()) ||
        incident.location.toLowerCase().includes(search.toLowerCase()) ||
        incident.team.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || incident.status === status;

      const matchesPriority =
        priority === "All" || incident.priority === priority;

      const matchesCategory =
        category === "All" || incident.category === category;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [incidents, search, status, priority, category]);

  const clearFilters = () => {
    setSearch("");
    setStatus("All");
    setPriority("All");
    setCategory("All");
  };

  const criticalCount = incidents.filter(
    (i) => i.priority === "Critical",
  ).length;

  const highPriorityCount = incidents.filter(
    (i) => i.priority === "High",
  ).length;

  const slaAtRiskCount = incidents.filter(
    (i) => i.sla === "At Risk",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 bg-slate-950 text-white md:flex md:flex-col">
          <div className="border-b border-slate-800 px-6 py-6">
            <div className="text-lg font-bold">Campus Incident</div>
            <div className="mt-1 text-xs text-slate-400">
              Management Platform
            </div>
          </div>

          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                C
              </div>

              <div>
                <div className="text-sm font-semibold">Coordinator</div>
                <div className="text-xs text-slate-400">
                  coordinator@college.edu
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            <Link
              href="/coordinator"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <span>⌂</span>
              Dashboard
            </Link>

            <Link
              href="/coordinator/incidents"
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
            >
              <span>▣</span>
              All Incidents
            </Link>

            <Link
              href="/coordinator/analytics"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <span>▥</span>
              Analytics
            </Link>

            <Link
              href="/coordinator/notifications"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <span>🔔</span>
              Notifications
            </Link>
          </nav>

          <div className="border-t border-slate-800 p-4">
            <Link
              href="/login"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              ← Sign Out
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-4 px-6 py-5 lg:flex-row lg:items-center lg:px-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  All Incidents
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor, review and manage all reported campus incidents.
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm">
                <span className="font-semibold">
                  {filteredIncidents.length}
                </span>{" "}
                incidents shown
              </div>
            </div>
          </header>

          <div className="space-y-6 p-6 lg:p-8">
            {/* Summary */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Total</div>

                <div className="mt-2 text-3xl font-bold">
                  {incidents.length}
                </div>
              </div>

              <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Critical</div>

                <div className="mt-2 text-3xl font-bold text-red-600">
                  {criticalCount}
                </div>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">
                  High Priority
                </div>

                <div className="mt-2 text-3xl font-bold text-orange-600">
                  {highPriorityCount}
                </div>
              </div>

              <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">
                  SLA At Risk
                </div>

                <div className="mt-2 text-3xl font-bold text-red-600">
                  {slaAtRiskCount}
                </div>
              </div>
            </section>

            {/* Critical Alert */}
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                  !
                </div>

                <div>
                  <h2 className="font-bold text-red-900">
                    Immediate Attention Required
                  </h2>

                  <p className="mt-1 text-sm text-red-800">
                    There are critical or SLA-at-risk incidents requiring
                    coordinator review.
                  </p>
                </div>
              </div>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-4">
                <div className="lg:col-span-1">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Search
                  </label>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ID, title, location..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option>All</option>
                    <option>Open</option>
                    <option>Acknowledged</option>
                    <option>Assigned</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option>All</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option>All</option>
                    <option>Water</option>
                    <option>Electrical</option>
                    <option>Security</option>
                    <option>Medical</option>
                    <option>IT</option>
                    <option>Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>
            </section>

            {/* Incident Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-bold">Incident Records</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review incident status, priority, response team and SLA.
                </p>
              </div>

              {loading && (
                <div className="px-6 py-12 text-center">
                  <div className="text-lg font-semibold">
                    Loading incidents...
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="px-6 py-12 text-center">
                  <div className="text-lg font-semibold text-red-600">
                    Unable to load incidents
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {error}
                  </p>
                </div>
              )}

              {!loading && !error && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Incident</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Team</th>
                        <th className="px-6 py-4">SLA</th>
                        <th className="px-6 py-4">Reported</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredIncidents.map((incident) => (
                        <tr
                          key={incident.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <div className="font-semibold">
                              {incident.title}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              {incident.id}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-slate-600">
                            {incident.category}
                          </td>

                          <td className="px-6 py-5 text-slate-600">
                            {incident.location}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyle[incident.priority]}`}
                            >
                              {incident.priority}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[incident.status]}`}
                            >
                              {incident.status}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-slate-600">
                            {incident.team}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${slaStyle[incident.sla]}`}
                            >
                              {incident.sla}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-slate-500">
                            {incident.reported}
                          </td>

                          <td className="px-6 py-5">
                            <Link
                              href={`/coordinator/incidents/${incident.id.replace(
                                "INC-",
                                "",
                              )}`}
                              className="rounded-lg bg-black px-3 py-2 text-xs font-semibold !text-white transition hover:bg-slate-800"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading &&
                !error &&
                filteredIncidents.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="text-lg font-semibold">
                      No incidents found
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </div>
                )}
            </section>

            {/* Workflow */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Coordinator Incident Workflow
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                {[
                  "Review",
                  "Classify",
                  "Prioritize",
                  "Assign",
                  "Monitor SLA",
                  "Resolve",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-xl bg-slate-50 p-4 text-center"
                  >
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="mt-2 text-sm font-semibold">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}