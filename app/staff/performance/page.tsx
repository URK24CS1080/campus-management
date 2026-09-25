"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const weeklyData = [
  { day: "Mon", resolved: 4 },
  { day: "Tue", resolved: 6 },
  { day: "Wed", resolved: 5 },
  { day: "Thu", resolved: 8 },
  { day: "Fri", resolved: 7 },
  { day: "Sat", resolved: 3 },
  { day: "Sun", resolved: 5 },
];

const categoryData = [
  { category: "Water", count: 12 },
  { category: "Electrical", count: 9 },
  { category: "Infrastructure", count: 7 },
  { category: "IT", count: 5 },
  { category: "Security", count: 4 },
];

export default function StaffPerformance() {
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
                <p className="text-sm font-semibold">Rahul Sharma</p>
                <p className="text-xs text-slate-400">Maintenance Team</p>
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
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Assigned Incidents
            </Link>

            <Link
              href="/staff/sla"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              SLA & Escalation
            </Link>

            <Link
              href="/staff/performance"
              className="block rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
            >
              Performance
            </Link>

            <Link
              href="/staff/notifications"
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <span>Notifications</span>
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                3
              </span>
            </Link>
          </nav>

          <div className="border-t border-slate-800 px-5 py-5">
            <Link
              href="/staff/profile"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Profile & Settings
            </Link>

            <Link
              href="/login"
              className="mt-2 block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Logout
            </Link>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          {/* Mobile Header */}
          <header className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex items-center justify-between">
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

            <div className="mt-4 grid grid-cols-4 gap-2">
              <Link
                href="/staff"
                className="rounded-lg bg-slate-100 px-1 py-2 text-center text-[10px] font-semibold text-slate-700"
              >
                Home
              </Link>

              <Link
                href="/staff/incidents"
                className="rounded-lg bg-slate-100 px-1 py-2 text-center text-[10px] font-semibold text-slate-700"
              >
                Incidents
              </Link>

              <Link
                href="/staff/sla"
                className="rounded-lg bg-slate-100 px-1 py-2 text-center text-[10px] font-semibold text-slate-700"
              >
                SLA
              </Link>

              <Link
                href="/staff/performance"
                className="rounded-lg bg-slate-950 px-1 py-2 text-center text-[10px] font-semibold !text-white"
              >
                Stats
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Response Staff
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Performance
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Track your response activity, resolution performance and SLA
                compliance.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs text-slate-500">Incidents Handled</p>
                <p className="mt-2 text-2xl font-bold sm:text-3xl">48</p>
                <p className="mt-1 text-xs text-green-600">+12% this month</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs text-slate-500">Resolved</p>
                <p className="mt-2 text-2xl font-bold sm:text-3xl">39</p>
                <p className="mt-1 text-xs text-green-600">81% resolution rate</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs text-slate-500">Avg Response</p>
                <p className="mt-2 text-2xl font-bold sm:text-3xl">6.4 min</p>
                <p className="mt-1 text-xs text-green-600">Better than target</p>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm sm:p-5">
                <p className="text-xs text-green-600">SLA Compliance</p>
                <p className="mt-2 text-2xl font-bold text-green-700 sm:text-3xl">
                  94%
                </p>
                <p className="mt-1 text-xs text-green-700">Excellent</p>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h3 className="font-bold">Weekly Resolutions</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Incidents resolved over the last 7 days.
                  </p>
                </div>

                <div className="mt-5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="resolved" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h3 className="font-bold">Incidents by Category</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Categories handled by you.
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  {categoryData.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold">{item.count}</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900"
                          style={{
                            width: `${(item.count / 12) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">Acknowledgement Rate</p>
                <p className="mt-2 text-3xl font-bold">98%</p>
                <p className="mt-2 text-xs text-slate-500">
                  Incidents acknowledged within target time.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">Resolution Rate</p>
                <p className="mt-2 text-3xl font-bold">81%</p>
                <p className="mt-2 text-xs text-slate-500">
                  Assigned incidents successfully resolved.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">Escalations</p>
                <p className="mt-2 text-3xl font-bold">2</p>
                <p className="mt-2 text-xs text-slate-500">
                  Incidents requiring coordinator escalation.
                </p>
              </div>
            </div>

            {/* Recent Performance */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold">Recent Performance</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Latest completed response activities.
                  </p>
                </div>

                <span className="text-xs font-semibold text-green-600">
                  Performance: Excellent
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Fastest Response</p>
                  <p className="mt-1 text-lg font-bold">2.8 min</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Avg Resolution</p>
                  <p className="mt-1 text-lg font-bold">34.2 min</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Current Streak</p>
                  <p className="mt-1 text-lg font-bold">7 days</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}