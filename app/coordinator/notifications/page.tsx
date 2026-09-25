"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification as ApiNotification,
} from "@/lib/api";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  incidentId: string;
  time: string;
  unread: boolean;
};

const typeStyles: Record<string, string> = {
  "Critical Incident": "bg-red-100 text-red-700",
  "SLA Warning": "bg-orange-100 text-orange-700",
  "New Incident": "bg-blue-100 text-blue-700",
  Assignment: "bg-purple-100 text-purple-700",
  Resolution: "bg-green-100 text-green-700",
};

function mapNotificationType(type: string) {
  switch (type.toLowerCase()) {
    case "assigned":
      return "Assignment";

    case "assignment":
      return "Assignment";

    case "critical":
    case "critical_incident":
      return "Critical Incident";

    case "sla":
    case "sla_warning":
      return "SLA Warning";

    case "new":
    case "new_incident":
      return "New Incident";

    case "resolved":
    case "resolution":
      return "Resolution";

    default:
      return type || "Notification";
  }
}

function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const difference = Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60),
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  return `${days} days ago`;
}

function convertNotification(
  notification: ApiNotification,
): Notification {
  return {
    id: notification.id,
    type: mapNotificationType(notification.type),
    title: notification.title,
    message: notification.message,
    incidentId: notification.incident_id
      ? `INC-${notification.incident_id}`
      : "N/A",
    time: formatNotificationTime(
      notification.created_at,
    ),
    unread: !notification.read,
  };
}

export default function CoordinatorNotificationsPage() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState<
    number | null
  >(null);

  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");

        const data = await getNotifications();

        setNotifications(
          data.map(convertNotification),
        );
      } catch (err) {
        console.error(
          "Failed to load notifications:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load notifications.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  const markAsRead = async (id: number) => {
    try {
      setActionLoading(id);

      await markNotificationRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                unread: false,
              }
            : notification,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark notification as read.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setError("");

      await markAllNotificationsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          unread: false,
        })),
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark all notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const criticalOrSlaCount = notifications.filter(
    (notification) =>
      notification.type === "Critical Incident" ||
      notification.type === "SLA Warning",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-950 px-4 py-6 text-white">
          <div className="mb-8 px-3">
            <h1 className="text-xl font-bold">
              CampusSafe
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              Incident Management Platform
            </p>
          </div>

          <div className="mb-6 rounded-xl bg-slate-900 px-4 py-3">
            <p className="text-xs text-slate-400">
              Logged in as
            </p>

            <p className="mt-1 text-sm font-semibold">
              Coordinator
            </p>

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
              className="flex items-center rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              Analytics
            </Link>

            <Link
              href="/coordinator/notifications"
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
            >
              <span className="!text-black">
                Notifications
              </span>

              {unreadCount > 0 && (
                <span className="rounded-full bg-black px-2 py-0.5 text-xs !text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Notifications
                </h2>

                <p className="mt-2 text-slate-500">
                  Stay updated on incidents, assignments,
                  SLA risks, and resolutions.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  className="rounded-xl bg-black px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {markingAll
                    ? "Marking..."
                    : "Mark All as Read"}
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">
                  {error}
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Notifications
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {notifications.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Unread
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {unreadCount}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Critical / SLA Alerts
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {criticalOrSlaCount}
                </p>
              </div>
            </div>

            {/* Alert */}
            {notifications.some(
              (notification) =>
                notification.unread &&
                notification.type ===
                  "Critical Incident",
            ) && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                    !
                  </div>

                  <div>
                    <p className="font-bold text-red-800">
                      Critical incident requires attention
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      There are unread critical alerts in
                      the notification center. Review them
                      and ensure the appropriate response
                      team is assigned.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notification List */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold">
                  Recent Notifications
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Latest coordinator alerts and incident
                  updates.
                </p>
              </div>

              {loading && (
                <div className="px-6 py-12 text-center">
                  <p className="text-lg font-semibold">
                    Loading notifications...
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Fetching notifications from the backend.
                  </p>
                </div>
              )}

              {!loading &&
                !error &&
                notifications.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-lg font-semibold">
                      No notifications
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      There are currently no notifications
                      for this coordinator.
                    </p>
                  </div>
                )}

              {!loading &&
                notifications.length > 0 && (
                  <div className="divide-y divide-slate-200">
                    {notifications.map(
                      (notification) => (
                        <div
                          key={notification.id}
                          className={`px-6 py-5 transition ${
                            notification.unread
                              ? "bg-slate-50"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex gap-4">
                              <div
                                className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                  notification.type ===
                                  "Critical Incident"
                                    ? "bg-red-100 text-red-700"
                                    : notification.type ===
                                        "SLA Warning"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {notification.type ===
                                "Critical Incident"
                                  ? "!"
                                  : notification.type ===
                                      "SLA Warning"
                                    ? "⏱"
                                    : "•"}
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold">
                                    {notification.title}
                                  </h4>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      typeStyles[
                                        notification.type
                                      ] ??
                                      "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {notification.type}
                                  </span>

                                  {notification.unread && (
                                    <span className="rounded-full bg-black px-2.5 py-1 text-xs font-semibold !text-white">
                                      Unread
                                    </span>
                                  )}
                                </div>

                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                  {notification.message}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                                  <span>
                                    {notification.time}
                                  </span>

                                  <span>
                                    Incident:{" "}
                                    <span className="font-semibold text-slate-600">
                                      {
                                        notification.incidentId
                                      }
                                    </span>
                                  </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                  {notification.incidentId !==
                                    "N/A" && (
                                    <Link
                                      href={`/coordinator/incidents/${notification.incidentId.replace(
                                        "INC-",
                                        "",
                                      )}`}
                                      onClick={() => {
                                        if (
                                          notification.unread
                                        ) {
                                          markAsRead(
                                            notification.id,
                                          );
                                        }
                                      }}
                                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                      View Incident
                                    </Link>
                                  )}

                                  {notification.unread && (
                                    <button
                                      onClick={() =>
                                        markAsRead(
                                          notification.id,
                                        )
                                      }
                                      disabled={
                                        actionLoading ===
                                        notification.id
                                      }
                                      className="rounded-lg bg-black px-4 py-2 text-xs font-semibold !text-white transition hover:bg-slate-800 disabled:opacity-50"
                                    >
                                      {actionLoading ===
                                      notification.id
                                        ? "Updating..."
                                        : "Mark as Read"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
            </section>

            {/* Notification Information */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="font-semibold">
                  Critical Alerts
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  High-risk incidents requiring immediate
                  coordinator attention.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="font-semibold">
                  SLA Monitoring
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Alerts help coordinators identify incidents
                  approaching their response deadlines.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="font-semibold">
                  Response Updates
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Assignment and resolution updates keep the
                  incident workflow visible.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}