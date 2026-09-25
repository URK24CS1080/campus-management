"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getAnalyticsSummary,
  getIncidents,
  AnalyticsSummary,
  Incident,
} from "@/lib/api";

const priorityColors = ["#dc2626", "#ea580c", "#ca8a04", "#64748b"];

export default function CoordinatorAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const [summaryData, incidentsData] = await Promise.all([
          getAnalyticsSummary(),
          getIncidents(),
        ]);

        setSummary(summaryData);
        setIncidents(incidentsData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const categoryCounts: Record<string, number> = {};

  incidents.forEach((incident) => {
    const category = incident.category || "Unknown";
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts)
    .map(([name, incidents]) => ({
      name,
      incidents,
    }))
    .sort((a, b) => b.incidents - a.incidents);

  const priorityCounts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  incidents.forEach((incident) => {
    const priority = incident.priority;

    if (priority in priorityCounts) {
      priorityCounts[priority as keyof typeof priorityCounts]++;
    }
  });

  const priorityData = [
    { name: "Critical", value: priorityCounts.Critical },
    { name: "High", value: priorityCounts.High },
    { name: "Medium", value: priorityCounts.Medium },
    { name: "Low", value: priorityCounts.Low },
  ];

  const statusCounts: Record<string, number> = {};

  incidents.forEach((incident) => {
    const status = incident.status || "UNKNOWN";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const statusData = [
    {
      name: "Open",
      value: statusCounts.OPEN || 0,
    },
    {
      name: "Assigned",
      value: statusCounts.ASSIGNED || 0,
    },
    {
      name: "Resolved",
      value: statusCounts.RESOLVED || 0,
    },
  ];

  const highestCategory =
    categoryData.length > 0 ? categoryData[0].name : "N/A";

  const highestCategoryCount =
    categoryData.length > 0 ? categoryData[0].incidents : 0;

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
              className="flex items-center rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
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
              className="flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
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
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">
                Analytics
              </h2>

              <p className="mt-2 text-slate-500">
                Monitor incident trends, priorities, statuses, and
                operational activity.
              </p>
            </div>

            {loading && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Loading analytics...
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* KPI Cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Incidents</p>

                <p className="mt-2 text-3xl font-bold">
                  {loading ? "..." : summary?.total_incidents ?? 0}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Current total
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Escalated Incidents
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {loading
                    ? "..."
                    : summary?.escalated_incidents ?? 0}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Incidents currently escalated
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h3 className="font-bold">Incidents by Category</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribution across incident categories.
                  </p>
                </div>

                <div className="h-80">
                  {categoryData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      No incident data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="name" />

                        <YAxis allowDecimals={false} />

                        <Tooltip />

                        <Bar
                          dataKey="incidents"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h3 className="font-bold">Priority Distribution</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Incidents grouped by priority level.
                  </p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={105}
                        label
                      >
                        {priorityData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={priorityColors[index]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h3 className="font-bold">Incident Status</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Current lifecycle state of all incidents.
                  </p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                      />

                      <YAxis
                        dataKey="name"
                        type="category"
                        width={90}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* Insights */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold">
                Operational Insights
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold">Highest Category</p>

                  <p className="mt-1 text-sm text-slate-500">
  {highestCategory === "N/A"
    ? "No category data available."
    : highestCategory +
      " incidents are currently the most frequent with " +
      highestCategoryCount +
      " incident" +
      (highestCategoryCount === 1 ? "" : "s") +
      "."}
</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold">
                    Attention Required
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
  {summary?.escalated_incidents
    ? summary.escalated_incidents +
      " incident" +
      (summary.escalated_incidents === 1 ? "" : "s") +
      " currently escalated."
    : "No escalated incidents currently reported."}
</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

