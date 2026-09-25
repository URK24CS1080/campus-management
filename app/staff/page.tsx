"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import { getIncidents, type Incident as ApiIncident } from "@/lib/api";

type StaffIncident = {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Assigned" | "Acknowledged" | "In Progress" | "Resolved";
  sla: string;
  time: string;
};

const priorityStyles: Record<StaffIncident["priority"], string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-slate-100 text-slate-700",
};

const statusStyles: Record<StaffIncident["status"], string> = {
  Assigned: "bg-blue-100 text-blue-700",
  Acknowledged: "bg-purple-100 text-purple-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  Resolved: "bg-green-100 text-green-700",
};

function formatStatus(status: string): StaffIncident["status"] {
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

function formatPriority(priority: string): StaffIncident["priority"] {
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

  if (Number.isNaN(date.getTime())) return "Unknown";

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function convertIncident(incident: ApiIncident): StaffIncident {
  return {
    id: `INC-${incident.id}`,
    title: incident.title,
    category: incident.category,
    location: incident.location,
    priority: formatPriority(incident.priority),
    status: formatStatus(incident.status),
    sla: "N/A",
    time: formatTime(incident.created_at),
  };
}

export default function StaffDashboard() {
  const [incidents, setIncidents] = useState<StaffIncident[]>([]);
  const [search, setSearch] = useState("");
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

  const filteredIncidents = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return incidents;

    return incidents.filter(
      (incident) =>
        incident.id.toLowerCase().includes(query) ||
        incident.title.toLowerCase().includes(query) ||
        incident.category.toLowerCase().includes(query) ||
        incident.location.toLowerCase().includes(query)
    );
  }, [search, incidents]);

  const assignedCount = incidents.filter(
    (incident) => incident.status === "Assigned"
  ).length;

  const inProgressCount = incidents.filter(
    (incident) => incident.status === "In Progress"
  ).length;

  const criticalCount = incidents.filter(
    (incident) => incident.priority === "Critical"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 bg-slate-950 text-white md:flex md:flex-col">

          {/* Header */}
          <div className="border-b border-slate-800 px-6 py-6">
            <h1 className="text-lg font-bold">
              Campus Response
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Response Staff Portal
            </p>
          </div>

          {/* Staff Identity */}
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

          {/* Navigation */}
<nav className="flex-1 space-y-2 px-3 py-5">
  {/* Dashboard */}
  <Link
    href="/staff"
    className="flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
  >
    Dashboard
  </Link>

  {/* Assigned Incidents */}
  <Link
    href="/staff/incidents"
    className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
  >
    Assigned Incidents
  </Link>

  {/* SLA & Escalation */}
  <Link
    href="/staff/sla"
    className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
  >
    SLA & Escalation
  </Link>

  {/* Performance */}
  <Link
    href="/staff/performance"
    className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
  >
    Performance
  </Link>

  {/* Notifications */}
  <Link
    href="/staff/notifications"
    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
  >
    <span>Notifications</span>
  </Link>

  {/* Profile & Settings */}
  <Link
    href="/staff/profile"
    className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
  >
    Profile & Settings
  </Link>
</nav>

{/* Logout */}
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

            {/* Mobile Navigation */}
            <div className="mt-4 grid grid-cols-3 gap-2">

              <Link
                href="/staff"
                className="rounded-lg bg-slate-950 px-3 py-2 text-center text-xs font-semibold !text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/staff/incidents"
                className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700"
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

            <div className="mt-2 grid grid-cols-3 gap-2">

              <Link
                href="/staff/sla"
                className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700"
              >
                SLA
              </Link>

              <Link
                href="/staff/performance"
                className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700"
              >
                Stats
              </Link>

              <Link
                href="/staff/profile"
                className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700"
              >
                Profile
              </Link>

            </div>
          </header>

          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Response Staff
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Good afternoon, Response Staff
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Here&apos;s an overview of your assigned incidents.
                </p>
              </div>

              <Link
                href="/staff/incidents"
                className="inline-flex w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 sm:w-auto"
              >
                View Assigned Incidents
              </Link>

            </div>

            {/* KPI Cards */}
            <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Assigned
                </p>

                <p className="mt-2 text-2xl font-bold sm:text-3xl">
                  {assignedCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Need action
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  In Progress
                </p>

                <p className="mt-2 text-2xl font-bold sm:text-3xl">
                  {inProgressCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Currently handling
                </p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm sm:p-5">
                <p className="text-xs font-medium text-red-600 sm:text-sm">
                  Critical
                </p>

                <p className="mt-2 text-2xl font-bold text-red-700 sm:text-3xl">
                  {criticalCount}
                </p>

                <p className="mt-1 text-xs text-red-600">
                  Immediate attention
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm sm:p-5">
                <p className="text-xs font-medium text-orange-600 sm:text-sm">
                  SLA At Risk
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-700 sm:text-3xl">
                  N/A
                </p>

                <p className="mt-1 text-xs text-orange-600">
                  Not available
                </p>
              </div>

            </div>

            {/* Critical Alert */}
            {criticalCount > 0 && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                    !
                  </div>

                  <div className="min-w-0">

                    <h3 className="font-semibold text-red-800">
                      Critical incident requires attention
                    </h3>

                    {(() => {
                      const criticalIncident = incidents.find(
                        (incident) => incident.priority === "Critical"
                      );

                      if (!criticalIncident) return null;

                      return (
                        <>
                          <p className="mt-1 text-sm leading-6 text-red-700">
                            {criticalIncident.id} —{" "}
                            {criticalIncident.title} in{" "}
                            {criticalIncident.location}.
                          </p>

                          <Link
                            href={`/staff/incidents/${criticalIncident.id}`}
                            className="mt-3 inline-block text-sm font-semibold text-red-800 underline"
                          >
                            View incident →
                          </Link>
                        </>
                      );
                    })()}

                  </div>
                </div>
              </div>
            )}

            {/* Recent Incidents */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-5 sm:p-6">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div>
                    <h3 className="text-lg font-bold">
                      Recent Assigned Incidents
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Incidents currently assigned to you.
                    </p>
                  </div>

                  <div className="w-full lg:w-72">

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search incidents..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                    />

                  </div>

                </div>
              </div>

              {loading && (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading assigned incidents...
                </div>
              )}

              {error && !loading && (
                <div className="p-8 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              {!loading && !error && (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">

                    <table className="w-full min-w-[850px]">

                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                          <th className="px-6 py-4">
                            Incident
                          </th>

                          <th className="px-6 py-4">
                            Category
                          </th>

                          <th className="px-6 py-4">
                            Priority
                          </th>

                          <th className="px-6 py-4">
                            Status
                          </th>

                          <th className="px-6 py-4">
                            SLA
                          </th>

                          <th className="px-6 py-4">
                            Action
                          </th>

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {filteredIncidents.map((incident) => (
                          <tr
                            key={incident.id}
                            className="hover:bg-slate-50"
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

                            <td className="px-6 py-4">

                              <Link
                                href={`/staff/incidents/${incident.id}`}
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

                  {/* Mobile cards */}
                  <div className="space-y-3 p-4 md:hidden">

                    {filteredIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="rounded-xl border border-slate-200 p-4"
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

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">

                          <div className="rounded-lg bg-slate-50 p-2">
                            <p className="text-slate-400">
                              Category
                            </p>

                            <p className="mt-1 font-medium">
                              {incident.category}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-2">
                            <p className="text-slate-400">
                              Location
                            </p>

                            <p className="mt-1 font-medium">
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

                        </div>

                        <Link
                          href={`/staff/incidents/${incident.id}`}
                          className="mt-4 block rounded-lg bg-black px-4 py-2.5 text-center text-xs font-semibold !text-white"
                        >
                          Review Incident
                        </Link>

                      </div>
                    ))}

                  </div>

                  {filteredIncidents.length === 0 && (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No incidents found.
                    </div>
                  )}

                </>
              )}

              <div className="border-t border-slate-200 p-4 text-center sm:p-5">

                <Link
                  href="/staff/incidents"
                  className="text-sm font-semibold text-slate-900 underline"
                >
                  View all assigned incidents →
                </Link>

              </div>

            </div>

            {/* Quick Actions */}
            <div className="mt-8">

              <h3 className="text-lg font-bold">
                Quick Actions
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <Link
                  href="/staff/incidents"
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="font-semibold">
                    Assigned Incidents
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Review and respond to your assigned incidents.
                  </p>
                </Link>

                <Link
                  href="/staff/notifications"
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="font-semibold">
                    Notifications
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Check critical alerts and new assignments.
                  </p>
                </Link>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <p className="font-semibold">
                    Today&apos;s Performance
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Performance metrics are not available from the current
                    backend.
                  </p>

                </div>

              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

