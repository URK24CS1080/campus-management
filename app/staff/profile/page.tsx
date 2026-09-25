"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StaffProfile() {
  const [email, setEmail] = useState("Loading...");
  const [role, setRole] = useState("Staff");

  const [notifications, setNotifications] = useState(true);
  const [slaAlerts, setSlaAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedEmail =
      localStorage.getItem("campus_email") ||
      sessionStorage.getItem("campus_email");

    const storedRole =
      localStorage.getItem("campus_role") ||
      sessionStorage.getItem("campus_role");

    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (storedRole) {
      setRole(
        storedRole.charAt(0).toUpperCase() + storedRole.slice(1)
      );
    }

    const storedNotifications =
      localStorage.getItem("staff_notifications");

    const storedSlaAlerts =
      localStorage.getItem("staff_sla_alerts");

    const storedCriticalAlerts =
      localStorage.getItem("staff_critical_alerts");

    if (storedNotifications !== null) {
      setNotifications(storedNotifications === "true");
    }

    if (storedSlaAlerts !== null) {
      setSlaAlerts(storedSlaAlerts === "true");
    }

    if (storedCriticalAlerts !== null) {
      setCriticalAlerts(storedCriticalAlerts === "true");
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      "staff_notifications",
      String(notifications)
    );

    localStorage.setItem(
      "staff_sla_alerts",
      String(slaAlerts)
    );

    localStorage.setItem(
      "staff_critical_alerts",
      String(criticalAlerts)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const displayName =
    email !== "Loading..."
      ? email
          .split("@")[0]
          .split(".")
          .map(
            (part) =>
              part.charAt(0).toUpperCase() + part.slice(1)
          )
          .join(" ")
      : "Response Staff";

  const initials =
    displayName
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "RS";

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
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {displayName}
                </p>
                <p className="text-xs text-slate-400">
                  {role}
                </p>
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
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Performance
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
              href="/staff/profile"
              className="block rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
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
                {initials}
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
                href="/staff/performance"
                className="rounded-lg bg-slate-100 px-1 py-2 text-center text-[10px] font-semibold text-slate-700"
              >
                Stats
              </Link>

              <Link
                href="/staff/profile"
                className="rounded-lg bg-slate-950 px-1 py-2 text-center text-[10px] font-semibold !text-white"
              >
                Profile
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div>
              <p className="text-sm font-medium text-slate-500">
                Response Staff
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Profile & Settings
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Manage your staff profile and notification preferences.
              </p>
            </div>

            {/* Profile Card */}
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xl font-bold text-white">
                  {initials}
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    {displayName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Response Staff • {role}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Staff Account
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold">Account Information</h3>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500">
                    Account Name
                  </label>

                  <input
                    value={displayName}
                    disabled
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">
                    Email
                  </label>

                  <input
                    value={email}
                    disabled
                    type="email"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">
                    Role
                  </label>

                  <input
                    value={role}
                    disabled
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">
                    Staff ID
                  </label>

                  <input
                    value="Not provided by backend"
                    disabled
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Profile name, staff ID and team assignment are currently
                managed by the backend and are not editable from this page.
              </p>
            </div>

            {/* Notification Settings */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold">Notification Preferences</h3>

              <p className="mt-1 text-sm text-slate-500">
                Choose which alert preferences should be enabled on this
                device.
              </p>

              <div className="mt-5 divide-y divide-slate-100">
                <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-semibold">
                      Incident Notifications
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Receive alerts when incidents are assigned to you.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) =>
                      setNotifications(e.target.checked)
                    }
                    className="h-5 w-5"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-semibold">
                      SLA Alerts
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Preference for SLA-related alerts. Actual SLA
                      notifications require backend support.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={slaAlerts}
                    onChange={(e) =>
                      setSlaAlerts(e.target.checked)
                    }
                    className="h-5 w-5"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-semibold">
                      Critical Alerts
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Preference for high-priority and critical incident
                      alerts.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={criticalAlerts}
                    onChange={(e) =>
                      setCriticalAlerts(e.target.checked)
                    }
                    className="h-5 w-5"
                  />
                </label>
              </div>
            </div>

            {/* Save */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {saved && (
                <p className="text-sm font-semibold text-green-600">
                  Preferences saved on this device.
                </p>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-xl bg-black px-6 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 sm:w-auto"
              >
                Save Changes
              </button>
            </div>

            {/* Security */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold">Account Security</h3>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Password</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Password management is handled by the account system.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Password change is not currently supported by the backend."
                    )
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-bold text-blue-900">
                Staff Access Level
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Your current role allows you to view assigned incidents,
                acknowledge incidents, update response status and resolve
                incidents. SLA metrics and escalation controls depend on
                backend functionality currently available.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

