"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "acknowledged" | "assigned" | "priority" | "sla" | "resolved";
  read: boolean;
  incidentId: string;
};

const notificationStyles = {
  acknowledged: {
    icon: "✓",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
  },
  assigned: {
    icon: "👷",
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconText: "text-purple-700",
  },
  priority: {
    icon: "!",
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconText: "text-orange-700",
  },
  sla: {
    icon: "⏱",
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconText: "text-red-700",
  },
  resolved: {
    icon: "✓",
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    iconText: "text-green-700",
  },
};

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] =
  useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

  const unreadCount = notifications.filter((item) => !item.read).length;
  useEffect(() => {
  const token =
    localStorage.getItem("campus_token") ||
    sessionStorage.getItem("campus_token");

  if (!token) {
    setError("You are not authenticated.");
    setLoading(false);
    return;
  }

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      return response.json();
    })
    .then((data) => {
      const formattedNotifications: Notification[] = data.map(
        (item: any) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          time: item.created_at
            ? new Date(item.created_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "Unknown",
          type: item.type,
          read: item.read,
          incidentId: item.incident_id
            ? `INC-${item.incident_id}`
            : "",
        })
      );

      setNotifications(formattedNotifications);
    })
    .catch((error) => {
      console.error("Failed to load notifications:", error);
      setError("Unable to load your notifications.");
    })
    .finally(() => {
      setLoading(false);
    });
}, []);

  const markAsRead = async (id: number) => {
  const token =
    localStorage.getItem("campus_token") ||
    sessionStorage.getItem("campus_token");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
};

  const markAllAsRead = async () => {
  const token =
    localStorage.getItem("campus_token") ||
    sessionStorage.getItem("campus_token");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read");
    }

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
      }))
    );
  } catch (error) {
    console.error(
      "Failed to mark all notifications as read:",
      error
    );
  }
};
  const handleSignOut = () => {
  localStorage.removeItem("campus_token");
  localStorage.removeItem("campus_role");
  localStorage.removeItem("campus_email");
  localStorage.removeItem("campus_remember_me");

  sessionStorage.removeItem("campus_token");
  sessionStorage.removeItem("campus_role");
  sessionStorage.removeItem("campus_email");

  router.push("/login");
};

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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">
                S
              </div>
              <div>
                <div className="text-sm font-semibold">Student</div>
                <div className="text-xs text-slate-400">
                  student@college.edu.in
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            <Link
              href="/student"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <span>⌂</span>
              Dashboard
            </Link>

            <Link
              href="/student/report"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <span>＋</span>
              Report Incident
            </Link>

            <Link
              href="/student/incidents"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              <span>▣</span>
              My Incidents
            </Link>

            <Link
              href="/student/notifications"
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
            >
              <span className="flex items-center gap-3">
                <span>🔔</span>
                Notifications
              </span>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </nav>

          <div className="border-t border-slate-800 p-4">
            <button
  onClick={handleSignOut}
  className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
>
  ← Sign Out
</button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-6 py-5 lg:px-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Stay updated about your reported incidents.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </header>

          <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
            {/* Summary */}
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Total Notifications</div>
                <div className="mt-2 text-3xl font-bold">
                  {notifications.length}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Unread</div>
                <div className="mt-2 text-3xl font-bold text-red-600">
                  {unreadCount}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Recent Updates</div>
                <div className="mt-2 text-3xl font-bold text-green-600">
                  {notifications.filter((item) => item.time !== "Yesterday").length}
                </div>
              </div>
            </section>

            {/* Notification List */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-bold">Recent Notifications</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Updates related to your incidents and campus response.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => {
                  const style = notificationStyles[notification.type];

                  return (
                    <div
                      key={notification.id}
                      className={`p-5 transition hover:bg-slate-50 ${
                        !notification.read ? "bg-slate-50/80" : "bg-white"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${style.iconBg} ${style.iconText} font-bold`}
                        >
                          {style.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-2 sm:flex-row">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {notification.title}
                              </h3>

                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                              )}
                            </div>

                            <span className="text-xs text-slate-400">
                              {notification.time}
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {notification.message}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <Link
                              href={`/student/incidents/${notification.incidentId}`}
                              className="rounded-lg bg-black px-3 py-2 text-xs font-semibold !text-white transition hover:bg-slate-800"
                            >
                              View Incident
                            </Link>

                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
                              >
                                Mark as read
                              </button>
                            )}

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.iconText}`}
                            >
                              {notification.incidentId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Notification Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">How notifications work</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="font-semibold">Incident Updates</div>
                  <p className="mt-1 text-sm text-slate-500">
                    You will be notified when your incident is acknowledged,
                    assigned, updated, or resolved.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="font-semibold">SLA Alerts</div>
                  <p className="mt-1 text-sm text-slate-500">
                    You may receive an alert when an incident is approaching
                    its response deadline.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="font-semibold">Priority Changes</div>
                  <p className="mt-1 text-sm text-slate-500">
                    Notifications are generated when the priority of an
                    incident is changed after review.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="font-semibold">Resolution Updates</div>
                  <p className="mt-1 text-sm text-slate-500">
                    Once the response team resolves an incident, the final
                    status will appear here.
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