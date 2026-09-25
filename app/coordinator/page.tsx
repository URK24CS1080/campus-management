"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getIncidents, type Incident as ApiIncident } from "@/lib/api";

type Incident = {
  id: number;
  title: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  sla: string;
  time: string;
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

function formatIncidentId(id: number) {
  return `INC-${id}`;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const difference = Math.floor(
    (now.getTime() - date.getTime()) / 1000,
  );

  if (difference < 60) {
    return `${Math.max(difference, 0)} sec ago`;
  }

  const minutes = Math.floor(difference / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function mapStatus(status: string) {
  switch (status) {
    case "OPEN":
      return "Open";

    case "ASSIGNED":
      return "Assigned";

    case "RESOLVED":
      return "Resolved";

    default:
      return status;
  }
}

function mapIncident(incident: ApiIncident): Incident {
  return {
    id: incident.id,
    title: incident.title,
    category: incident.category,
    location: incident.location,
    priority: incident.priority,
    status: mapStatus(incident.status),
    sla: "Not available",
    time: formatRelativeTime(incident.created_at),
  };
}

export default function CoordinatorDashboardPage() {
  const [search, setSearch] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadIncidents() {
      try {
        setLoading(true);
        setError("");

        const data = await getIncidents();

        if (!mounted) {
          return;
        }

        setIncidents(data.map(mapIncident));
      } catch (err) {
        if (!mounted) {
          return;
        }

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load incidents.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadIncidents();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    const query = search.toLowerCase();

    return (
      incident.id.toString().includes(query) ||
      formatIncidentId(incident.id).toLowerCase().includes(query) ||
      incident.title.toLowerCase().includes(query) ||
      incident.category.toLowerCase().includes(query) ||
      incident.location.toLowerCase().includes(query)
    );
  });

  const criticalCount = incidents.filter(
    (incident) => incident.priority === "Critical",
  ).length;

  const highCount = incidents.filter(
    (incident) => incident.priority === "High",
  ).length;

  const openCount = incidents.filter(
    (incident) => incident.status === "Open",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-slate-950 px-4 py-6 text-white">
          <div className="mb-8 px-3">
            <h1 className="text-xl font-bold">CampusSafe</h1>
            <p className="mt-1 text-xs text-slate-400">
              Incident Management Platform
            </p>
          </div>

          <div className="mb-6 rounded-xl bg-slate-900 px-4 py-3">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="mt-1 text-sm font-semibold">Coordinator</p>
            <p className="mt-1 text-xs text-slate-500">
              coordinator@college.edu
            </p>
          </div>

          <nav className="space-y-2">
            <Link
              href="/coordinator"
              className="flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
            >
              Dashboard
            </Link>

            <Link
              href="/coordinator/incidents"
              className="flex items-center rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
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

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-8 py-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Coordinator Dashboard
                </h2>

                <p className="mt-2 text-slate-500">
                  Monitor campus incidents and coordinate emergency response.
                </p>
              </div>

              <Link
                href="/coordinator/incidents"
                className="rounded-xl bg-black px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                View All Incidents
              </Link>
            </div>

            {/* KPI Cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Incidents</p>

                <p className="mt-2 text-3xl font-bold">
                  {loading ? "..." : incidents.length}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  All reported incidents
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Open Incidents</p>

                <p className="mt-2 text-3xl font-bold">
                  {loading ? "..." : openCount}
                </p>

                <p className="mt-2 text-xs text-orange-600">
                  Requires monitoring
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">High Priority</p>

                <p className="mt-2 text-3xl font-bold">
                  {loading ? "..." : criticalCount + highCount}
                </p>

                <p className="mt-2 text-xs text-red-600">
                  {loading ? "..." : criticalCount} critical
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">SLA Compliance</p>

                <p className="mt-2 text-3xl font-bold">N/A</p>

                <p className="mt-2 text-xs text-slate-500">
                  SLA data unavailable
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-bold text-red-800">
                  Unable to load incidents
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Critical Alert */}
            {!loading && criticalCount > 0 && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-red-800">
                      Critical incidents require attention
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {criticalCount} critical incidents are currently present.
                      Review response assignments and SLA status.
                    </p>
                  </div>

                  <Link
                    href="/coordinator/incidents"
                    className="shrink-0 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold !text-white hover:bg-red-800"
                  >
                    Review
                  </Link>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <input
                type="text"
                placeholder="Search recent incidents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            {/* Recent Incidents */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h3 className="font-bold">Recent Incidents</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest incidents requiring coordinator attention.
                  </p>
                </div>

                <Link
                  href="/coordinator/incidents"
                  className="text-sm font-semibold text-slate-700 hover:text-black"
                >
                  View all →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Incident</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Priority</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">SLA</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-10 text-center text-sm text-slate-500"
                        >
                          Loading incidents...
                        </td>
                      </tr>
                    ) : filteredIncidents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-10 text-center text-sm text-slate-500"
                        >
                          No incidents found.
                        </td>
                      </tr>
                    ) : (
                      filteredIncidents.map((incident) => (
                        <tr
                          key={incident.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold">
                              {formatIncidentId(incident.id)}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {incident.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {incident.location} · {incident.time}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            {incident.category}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                priorityStyles[incident.priority] ??
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {incident.priority}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                statusStyles[incident.status] ??
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {incident.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-slate-500">
                              {incident.sla}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <Link
                              href={`/coordinator/incidents/${incident.id}`}
                              className="font-semibold text-slate-700 hover:text-black"
                            >
                              Review →
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Quick Insights */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link
                href="/coordinator/analytics"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
              >
                <p className="font-bold">Analytics</p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Analyze categories, priorities, response times, and SLA
                  performance.
                </p>

                <p className="mt-4 text-sm font-semibold">
                  Open Analytics →
                </p>
              </Link>

              <Link
                href="/coordinator/notifications"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
              >
                <p className="font-bold">Notifications</p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review critical alerts, SLA warnings, assignments, and
                  resolutions.
                </p>

                <p className="mt-4 text-sm font-semibold">
                  Open Notifications →
                </p>
              </Link>

              <Link
                href="/coordinator/incidents"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
              >
                <p className="font-bold">Incident Management</p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review, classify, prioritize, assign, and monitor all
                  incidents.
                </p>

                <p className="mt-4 text-sm font-semibold">
                  Manage Incidents →
                </p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}