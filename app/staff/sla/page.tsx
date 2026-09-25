"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getIncidents, type Incident as ApiIncident } from "@/lib/api";

type StaffIncident = {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  location: string;
};

function formatStatus(status: string) {
  switch (status?.toUpperCase()) {
    case "RESOLVED":
      return "Resolved";
    case "IN_PROGRESS":
      return "In Progress";
    case "ACKNOWLEDGED":
      return "Acknowledged";
    case "ASSIGNED":
      return "Assigned";
    case "OPEN":
      return "Assigned";
    default:
      return status || "Unknown";
  }
}

function formatPriority(priority: string) {
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

function convertIncident(incident: ApiIncident): StaffIncident {
  return {
    id: incident.id,
    title: incident.title,
    category: incident.category,
    priority: formatPriority(incident.priority),
    status: formatStatus(incident.status),
    location: incident.location,
  };
}

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-slate-100 text-slate-700",
};

export default function StaffSLA() {
  const [incidents, setIncidents] = useState<StaffIncident[]>([]);
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
        console.error("Failed to load SLA incidents:", err);

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
              className="block rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
            >
              SLA & Escalation
            </Link>

            <Link
              href="/staff/performance"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Performance
            </Link>

            <Link
              href="/staff/notifications"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Notifications
            </Link>

            <Link
              href="/staff/profile"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Profile & Settings
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

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Link
                href="/staff"
                className="rounded-lg bg-slate-100 px-2 py-2 text-center text-[10px] font-semibold text-slate-700"
              >
                Home
              </Link>

              <Link
                href="/staff/incidents"
                className="rounded-lg bg-slate-100 px-2 py-2 text-center text-[10px] font-semibold text-slate-700"
              >
                Incidents
              </Link>

              <Link
                href="/staff/sla"
                className="rounded-lg bg-slate-950 px-2 py-2 text-center text-[10px] font-semibold !text-white"
              >
                SLA
              </Link>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <Link
                href="/staff/notifications"
                className="rounded-lg bg-slate-100 px-2 py-2 text-center text-[10px] font-semibold text-slate-700"
              >
                Alerts
              </Link>

              <Link
                href="/staff/performance"
                className="rounded-lg bg-slate-100 px-2 py-2 text-center text-[10px] font-semibold text-slate-700"
              >
                Stats
              </Link>

              <Link
                href="/staff/profile"
                className="rounded-lg bg-slate-100 px-2 py-2 text-center text-[10px] font-semibold text-slate-700"
              >
                Profile
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div>
              <p className="text-sm font-medium text-slate-500">
                Response Staff
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                SLA & Escalation
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor assigned incidents and review SLA information provided
                by the response management system.
              </p>
            </div>

            {/* SLA Status */}
            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs text-slate-500">SLA Compliance</p>
                <p className="mt-2 text-2xl font-bold text-slate-700 sm:text-3xl">
                  N/A
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Backend metric unavailable
                </p>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm sm:p-5">
                <p className="text-xs text-green-600">Within SLA</p>
                <p className="mt-2 text-2xl font-bold text-green-700 sm:text-3xl">
                  N/A
                </p>
                <p className="mt-1 text-xs text-green-600">
                  No live SLA calculation
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm sm:p-5">
                <p className="text-xs text-orange-600">At Risk</p>
                <p className="mt-2 text-2xl font-bold text-orange-700 sm:text-3xl">
                  N/A
                </p>
                <p className="mt-1 text-xs text-orange-600">
                  No live SLA calculation
                </p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm sm:p-5">
                <p className="text-xs text-red-600">Breached</p>
                <p className="mt-2 text-2xl font-bold text-red-700 sm:text-3xl">
                  N/A
                </p>
                <p className="mt-1 text-xs text-red-600">
                  No live SLA calculation
                </p>
              </div>
            </div>

            {/* Backend Availability Notice */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                  i
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    SLA monitoring data is not available through the current
                    API
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    The current backend does not expose SLA target times,
                    elapsed time, remaining time, compliance percentages, or
                    breach status to the Staff portal. Those values are
                    therefore not displayed as fabricated data.
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Incidents */}
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5 sm:p-6">
                <h3 className="text-lg font-bold">
                  Assigned Incidents
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Incidents currently assigned to you.
                </p>
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

              {!loading && !error && incidents.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  No incidents are currently assigned to you.
                </div>
              )}

              {!loading && !error && incidents.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px]">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-4">Incident</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">SLA</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {incidents.map((incident) => (
                        <tr
                          key={incident.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold">
                              {incident.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              INC-{incident.id} • {incident.location}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {incident.category}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                priorityStyles[incident.priority]
                              }`}
                            >
                              {incident.priority}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {incident.status}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              N/A
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
              )}
            </div>

            {/* Escalation Information */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold">
                Escalation
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Current backend escalation status and SLA breach details are
                not exposed through the Staff API.
              </p>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  No live escalation status available
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Staff can update incident status through the Incident Details
                  page. SLA breach detection and escalation metrics require
                  additional backend API support.
                </p>

                <Link
                  href="/staff/incidents"
                  className="mt-4 inline-block rounded-lg bg-black px-4 py-2.5 text-xs font-semibold !text-white"
                >
                  View Assigned Incidents
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

