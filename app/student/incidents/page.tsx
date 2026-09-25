"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Incident = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Acknowledged" | "Assigned" | "In Progress" | "Resolved";
  reportedAt: string;
};

export default function MyIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
    useEffect(() => {
    const token =
      localStorage.getItem("campus_token") ||
      sessionStorage.getItem("campus_token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/incidents/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch incidents");
        }

        return response.json();
      })
      .then((data) => {
        const formattedIncidents: Incident[] = data.map((item: any) => ({
          id: `INC-${item.id}`,
          title: item.title,
          description: item.description,
          location: item.location,
          category: item.category,
          priority: item.priority
            ? item.priority.charAt(0).toUpperCase() +
              item.priority.slice(1).toLowerCase()
            : "Medium",
          status: item.status
            ? item.status
                .toLowerCase()
                .split("_")
                .map(
                  (word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ")
            : "Open",
          reportedAt: item.created_at
            ? new Date(item.created_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "Pending",
        }));

        setIncidents(formattedIncidents);
      })
      .catch((error) => {
  console.error("Failed to load incidents:", error);
  setError("Unable to load your incidents. Please try again.");
})
.finally(() => {
  setLoading(false);
});
  }, []);

  const filteredIncidents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        incident.id.toLowerCase().includes(query) ||
        incident.title.toLowerCase().includes(query) ||
        incident.location.toLowerCase().includes(query) ||
        incident.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || incident.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || incident.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "All" || incident.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
    }, [incidents, search, statusFilter, priorityFilter, categoryFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
  };

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
                  My Incidents
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
            {/* Intro */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <Link
                  href="/student"
                  className="text-sm font-medium text-slate-500 hover:text-blue-600"
                >
                  ← Back to Dashboard
                </Link>

                <h3 className="mt-4 text-3xl font-bold tracking-tight">
                  Track your reports
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  View the status and progress of incidents you have reported.
                </p>
              </div>

              <Link
                href="/student/report"
                className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800"
              >
                + Report an Incident
              </Link>
            </section>

            {/* Summary */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Total"
                value={String(incidents.length)}
                description="All your reports"
              />

              <SummaryCard
                label="Open"
                value={String(
                  incidents.filter(
                    (incident) =>
                      incident.status === "Open" ||
                      incident.status === "Acknowledged"
                  ).length
                )}
                description="Awaiting action"
              />

              <SummaryCard
                label="In Progress"
                value={String(
                  incidents.filter(
                    (incident) => incident.status === "In Progress"
                  ).length
                )}
                description="Being handled"
              />

              <SummaryCard
                label="Resolved"
                value={String(
                  incidents.filter(
                    (incident) => incident.status === "Resolved"
                  ).length
                )}
                description="Successfully resolved"
              />
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h4 className="font-bold">Search & Filter</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Find a specific incident quickly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, title, location..."
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                />

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Acknowledged">Acknowledged</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                {/* Priority */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {/* Category */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  <option value="All">All Categories</option>
                  <option value="Fire">Fire</option>
                  <option value="Medical">Medical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Water">Water</option>
                  <option value="Infrastructure">
                    Infrastructure
                  </option>
                  <option value="IT">IT</option>
                  <option value="Security">Security</option>
                </select>
              </div>
            </section>

            {/* Incident table */}
{loading ? (
  <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
    <p className="text-sm text-slate-500">
      Loading your incidents...
    </p>
  </section>
) : error ? (
  <section className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
      !
    </div>

    <p className="mt-4 text-sm font-semibold text-red-700">
      Unable to load your incidents
    </p>

    <p className="mt-1 text-sm text-red-600">
      {error}
    </p>
  </section>
) : (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 p-6">
                <div>
                  <h4 className="text-lg font-bold">Incident Reports</h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredIncidents.length} incident
                    {filteredIncidents.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4 font-semibold">Incident</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Location</th>
                      <th className="px-6 py-4 font-semibold">Priority</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">
                        Reported
                      </th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredIncidents.map((incident) => (
                      <tr
                        key={incident.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/student/incidents/${incident.id}`}
                            className="group"
                          >
                            <p className="font-semibold text-slate-800 group-hover:text-blue-600">
                              {incident.title}
                            </p>

                            <p className="mt-1 text-xs font-medium text-slate-400">
                              {incident.id}
                            </p>
                          </Link>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                            {incident.category}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {incident.location}
                        </td>

                        <td className="px-6 py-5">
                          <PriorityBadge priority={incident.priority} />
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={incident.status} />
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {incident.reportedAt}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/student/incidents/${incident.id}`}
                            className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {filteredIncidents.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-16">
                          <div className="text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl">
                              🔍
                            </div>

                            <h5 className="mt-4 font-semibold text-slate-800">
                              No incidents found
                            </h5>

                            <p className="mt-1 text-sm text-slate-500">
                              Try changing your search or filters.
                            </p>

                            <button
                              type="button"
                              onClick={clearFilters}
                              className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                              Clear filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
)}

            {/* Status explanation */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="font-bold">Incident Status Guide</h4>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatusGuide
                  status="Open"
                  description="Report received and waiting for review."
                />

                <StatusGuide
                  status="Acknowledged"
                  description="Coordinator has reviewed the incident."
                />

                <StatusGuide
                  status="Assigned"
                  description="A response team has been assigned."
                />

                <StatusGuide
                  status="In Progress"
                  description="The response team is handling it."
                />

                <StatusGuide
                  status="Resolved"
                  description="The reported issue has been resolved."
                />
              </div>
            </section>

            <footer className="pb-2 text-center text-xs text-slate-400">
              Campus Incident Management & Emergency Response Platform
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">{description}</p>
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
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[priority]}`}
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
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function StatusGuide({
  status,
  description,
}: {
  status: Incident["status"];
  description: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <StatusBadge status={status} />

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}