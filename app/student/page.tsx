"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Incident = {
  id: string;
  title: string;
  location: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status:
    | "Open"
    | "Acknowledged"
    | "Assigned"
    | "In Progress"
    | "Resolved";
  time: string;
};

const notifications = [
  {
    title: "Incident assigned",
    message: "INC-2026-0042 has been assigned to the Maintenance Team.",
    time: "15 min ago",
    type: "assignment",
  },
  {
    title: "Incident under review",
    message: "Your reported electrical issue is being reviewed.",
    time: "Yesterday",
    type: "review",
  },
  {
    title: "Incident resolved",
    message: "Your medical assistance request has been resolved.",
    time: "28 Aug",
    type: "resolved",
  },
];

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

export default function StudentDashboard() {
  const [search, setSearch] = useState("");
const [incidents, setIncidents] = useState<Incident[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
useEffect(() => {
  const token =
    localStorage.getItem("campus_token") ||
    sessionStorage.getItem("campus_token");

  if (!token) {
    setError("You are not authenticated.");
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
        location: item.location,
        category: item.category,
        priority: item.priority
          ? item.priority.charAt(0).toUpperCase() +
            item.priority.slice(1).toLowerCase()
          : "Medium",
        status: formatStatus(item.status),
        time: item.created_at
          ? new Date(item.created_at).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "Unknown",
      }));

      setIncidents(formattedIncidents);
    })
    .catch((error) => {
      console.error("Failed to load incidents:", error);
      setError("Unable to load your incidents.");
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

  const filteredIncidents = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return incidents;

    return incidents.filter(
      (incident) =>
        incident.title.toLowerCase().includes(query) ||
        incident.id.toLowerCase().includes(query) ||
        incident.category.toLowerCase().includes(query) ||
        incident.location.toLowerCase().includes(query)
    );
  }, [search]);

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
                <p className="text-xs text-slate-400">Response Platform</p>
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
                className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium"
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
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
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

        {/* Main content */}
        <main className="flex-1">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-6 py-5 lg:px-8">
              <div>
                <p className="text-sm text-slate-500">Student Portal</p>
                <h2 className="text-2xl font-bold tracking-tight">
                  Good afternoon, Student 👋
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

          <div className="space-y-8 p-6 lg:p-8">
            {/* Emergency / report section */}
            <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow-sm">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="mb-2 text-sm font-medium text-blue-100">
                    Campus Safety
                  </p>

                  <h3 className="text-2xl font-bold">
                    See something that needs attention?
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                    Report safety, medical, electrical, security, or
                    infrastructure incidents. Your report will be reviewed and
                    assigned to the appropriate response team.
                  </p>
                </div>

                <Link
                  href="/student/report"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  + Report an Incident
                </Link>
              </div>
            </section>

            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
  label="Total Reports"
  value={String(incidents.length)}
  description="All incidents reported"
  icon="▤"
/>

<StatCard
  label="Open"
  value={String(
    incidents.filter(
      (incident) =>
        incident.status === "Open" ||
        incident.status === "Acknowledged" ||
        incident.status === "Assigned"
    ).length
  )}
  description="Awaiting action"
  icon="◷"
/>

<StatCard
  label="In Progress"
  value={String(
    incidents.filter(
      (incident) => incident.status === "In Progress"
    ).length
  )}
  description="Currently being handled"
  icon="↻"
/>

<StatCard
  label="Resolved"
  value={String(
    incidents.filter(
      (incident) => incident.status === "Resolved"
    ).length
  )}
  description="Successfully resolved"
  icon="✓"
/>
            </section>

            {/* Recent incidents */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold">My Recent Incidents</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Track the incidents you have reported.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search incidents..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white sm:w-64"
                    />
                  </div>

                  <Link
                    href="/student/incidents"
                    className="hidden rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:block"
                  >
                    View All
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4 font-semibold">Incident</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Priority</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Reported</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredIncidents.map((incident) => (
                      <tr
                        key={incident.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/student/incidents/${incident.id}`}
                            className="group"
                          >
                            <p className="font-semibold text-slate-800 group-hover:text-blue-600">
                              {incident.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {incident.id} · {incident.location}
                            </p>
                          </Link>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                            {incident.category}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <PriorityBadge priority={incident.priority} />
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={incident.status} />
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {incident.time}
                        </td>
                      </tr>
                    ))}

                    {filteredIncidents.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-sm text-slate-500"
                        >
                          No incidents found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Bottom cards */}
            <section className="grid gap-6 lg:grid-cols-2">
              {/* Notifications */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                  <div>
                    <h3 className="text-lg font-bold">Recent Notifications</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Updates about your incidents.
                    </p>
                  </div>

                  <Link
                    href="/student/notifications"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View All
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {notifications.map((notification, index) => (
                    <div key={index} className="flex gap-4 p-5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          notification.type === "resolved"
                            ? "bg-emerald-100 text-emerald-600"
                            : notification.type === "assignment"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {notification.type === "resolved"
                          ? "✓"
                          : notification.type === "assignment"
                            ? "→"
                            : "!"}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">Quick Actions</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Quickly access the most important student features.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <QuickAction
                    href="/student/report"
                    icon="+"
                    title="Report Incident"
                    description="Submit a new incident"
                  />

                  <QuickAction
                    href="/student/incidents"
                    icon="▤"
                    title="My Incidents"
                    description="Track your reports"
                  />

                  <QuickAction
                    href="/student/notifications"
                    icon="◉"
                    title="Notifications"
                    description="View latest updates"
                  />

                  <QuickAction
                    href="/"
                    icon="?"
                    title="Help & Support"
                    description="Get assistance"
                  />
                </div>

                <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex gap-3">
                    <div className="text-lg">🚨</div>

                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Emergency?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-700">
                        For immediate danger or life-threatening situations,
                        contact campus emergency services directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
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

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-semibold text-blue-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{description}</p>
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
  Acknowledged: "bg-amber-50 text-amber-700",
  Assigned: "bg-indigo-50 text-indigo-700",
  "In Progress": "bg-violet-50 text-violet-700",
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

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-700 transition group-hover:bg-blue-100 group-hover:text-blue-700">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </Link>
  );
}