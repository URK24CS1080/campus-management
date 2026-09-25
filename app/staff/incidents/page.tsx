"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getIncidents, type Incident as ApiIncident } from "@/lib/api";

type Incident = {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Assigned" | "Acknowledged" | "In Progress" | "Resolved";
  sla: "N/A";
  reported: string;
};

const priorityStyles: Record<Incident["priority"], string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-slate-100 text-slate-700",
};

const statusStyles: Record<Incident["status"], string> = {
  Assigned: "bg-blue-100 text-blue-700",
  Acknowledged: "bg-purple-100 text-purple-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  Resolved: "bg-green-100 text-green-700",
};

function formatStatus(status: string): Incident["status"] {
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

function formatTime(dateString: string) {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";

  return `${days} days ago`;
}

function convertIncident(incident: ApiIncident): Incident {
  return {
    id: `INC-${incident.id}`,
    title: incident.title,
    category: incident.category,
    location: incident.location,
    priority: formatPriority(incident.priority),
    status: formatStatus(incident.status),
    sla: "N/A",
    reported: formatTime(incident.created_at),
  };
}

export default function AssignedIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [slaFilter, setSlaFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadIncidents() {
      try {
        setLoading(true);
        setError("");

        const data = await getIncidents();

        if (!mounted) return;

        setIncidents(data.map(convertIncident));
      } catch (err) {
        console.error("Failed to load staff incidents:", err);

        if (mounted) {
          setError("Failed to load assigned incidents.");
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

  const categories = Array.from(
    new Set(incidents.map((incident) => incident.category))
  );

  const filteredIncidents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        incident.id.toLowerCase().includes(query) ||
        incident.title.toLowerCase().includes(query) ||
        incident.category.toLowerCase().includes(query) ||
        incident.location.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || incident.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || incident.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "All" || incident.category === categoryFilter;

      const matchesSla = slaFilter === "All" || incident.sla === slaFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesSla
      );
    });
  }, [
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    slaFilter,
    incidents,
  ]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setSlaFilter("All");
  };

  const activeFilterCount = [
    statusFilter !== "All",
    priorityFilter !== "All",
    categoryFilter !== "All",
    slaFilter !== "All",
  ].filter(Boolean).length;

  const criticalCount = incidents.filter(
    (incident) => incident.priority === "Critical"
  ).length;

  const activeCount = incidents.filter(
    (incident) => incident.status !== "Resolved"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
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
                <p className="text-sm font-semibold">Response Staff</p>
                <p className="text-xs text-slate-400">Assigned Team</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-5">
            <Link
              href="/staff"
              className="flex rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/staff/incidents"
              className="flex rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
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

        {/* Main */}
        <section className="min-w-0 flex-1">
          {/* Mobile Header */}
          <header className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-bold">Campus Response</h1>
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
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Response Staff
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Assigned Incidents
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Review incidents assigned to you and take the required
                  response action.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs text-slate-500">Showing</p>

                <p className="mt-1 text-lg font-bold">
                  {filteredIncidents.length}{" "}
                  <span className="text-sm font-medium text-slate-500">
                    of {incidents.length}
                  </span>
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">Total Assigned</p>

                <p className="mt-2 text-2xl font-bold">
                  {incidents.length}
                </p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
                <p className="text-xs text-red-600">Critical</p>

                <p className="mt-2 text-2xl font-bold text-red-700">
                  {criticalCount}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                <p className="text-xs text-blue-600">Active</p>

                <p className="mt-2 text-2xl font-bold text-blue-700">
                  {activeCount}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
                <p className="text-xs text-orange-600">SLA At Risk</p>

                <p className="mt-2 text-2xl font-bold text-orange-700">
                  N/A
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Search
                    </label>

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by ID, title, category or location..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:w-auto"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Status
                    </label>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Priority
                    </label>

                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="All">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Category
                    </label>

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="All">All Categories</option>

                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      SLA
                    </label>

                    <select
                      value={slaFilter}
                      onChange={(e) => setSlaFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="All">All SLA States</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <p className="text-xs text-slate-500">
                    {activeFilterCount} filter
                    {activeFilterCount > 1 ? "s" : ""} applied
                  </p>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  Loading assigned incidents...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Desktop Table */}
            {!loading && !error && (
              <div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-4">Incident</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
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
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold">
                              {incident.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {incident.id} • {incident.location}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {incident.category}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[incident.priority]}`}
                            >
                              {incident.priority}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[incident.status]}`}
                            >
                              {incident.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {incident.sla}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {incident.reported}
                          </td>

                          <td className="px-6 py-4">
                            <Link
                              href={`/staff/incidents/${incident.id.replace(
                                "INC-",
                                ""
                              )}`}
                              className="text-sm font-semibold text-slate-900 underline"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mobile Cards */}
            {!loading && !error && (
              <div className="mt-6 space-y-3 md:hidden">
                {filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-5">
                          {incident.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {incident.id}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${priorityStyles[incident.priority]}`}
                      >
                        {incident.priority}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Category
                        </p>

                        <p className="mt-1 text-xs font-semibold">
                          {incident.category}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Location
                        </p>

                        <p className="mt-1 text-xs font-semibold">
                          {incident.location}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[incident.status]}`}
                      >
                        {incident.status}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                        {incident.sla}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                        {incident.reported}
                      </span>
                    </div>

                    <Link
                      href={`/staff/incidents/${incident.id.replace(
                        "INC-",
                        ""
                      )}`}
                      className="mt-4 block rounded-xl bg-black px-4 py-3 text-center text-xs font-semibold !text-white"
                    >
                      Review Incident
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredIncidents.length === 0 && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg">
                  🔍
                </div>

                <h3 className="mt-4 font-semibold">No incidents found</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold !text-white"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Workflow */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold">Response Workflow</h3>

              <p className="mt-1 text-sm text-slate-500">
                Follow the incident through each response stage.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-700">01</p>
                  <p className="mt-2 text-sm font-semibold">Acknowledge</p>
                </div>

                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-xs font-semibold text-purple-700">02</p>
                  <p className="mt-2 text-sm font-semibold">Start Response</p>
                </div>

                <div className="rounded-xl bg-indigo-50 p-4">
                  <p className="text-xs font-semibold text-indigo-700">03</p>
                  <p className="mt-2 text-sm font-semibold">Update Status</p>
                </div>

                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-xs font-semibold text-green-700">04</p>
                  <p className="mt-2 text-sm font-semibold">Resolve</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

