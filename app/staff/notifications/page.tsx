"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification as ApiNotification,
} from "@/lib/api";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  incidentId: number | null;
  time: string;
  unread: boolean;
  urgent: boolean;
};

function formatTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";

  return `${days} days ago`;
}

function getNotificationType(type: string) {
  switch (type.toLowerCase()) {
    case "new":
      return "Critical Incident";

    case "assigned":
      return "Assignment";

    case "assignment":
      return "Assignment";

    case "escalation":
      return "Escalation";

    case "sla":
    case "sla_warning":
      return "SLA Warning";

    case "update":
      return "Update";

    default:
      return "Update";
  }
}

function convertNotification(notification: ApiNotification): Notification {
  const type = getNotificationType(notification.type);

  return {
    id: notification.id,
    type,
    title: notification.title,
    message: notification.message,
    incidentId: notification.incident_id,
    time: formatTime(notification.created_at),
    unread: !notification.read,
    urgent:
      type === "Critical Incident" ||
      type === "SLA Warning" ||
      type === "Escalation",
  };
}

const notificationStyles: Record<string, string> = {
  "Critical Incident": "bg-red-100 text-red-700",
  "SLA Warning": "bg-orange-100 text-orange-700",
  Assignment: "bg-blue-100 text-blue-700",
  Update: "bg-green-100 text-green-700",
  Escalation: "bg-purple-100 text-purple-700",
};

export default function StaffNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications();

      setNotifications(data.map(convertNotification));
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const urgentCount = notifications.filter(
    (notification) => notification.urgent
  ).length;

  const markAsRead = async (id: number) => {
    try {
      await markNotificationRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, unread: false }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          unread: false,
        }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read."
      );
    }
  };

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
              href="/staff/notifications"
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold !text-black"
            >
              <span>Notifications</span>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
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
                className="rounded-lg bg-slate-100 px-2 py-2 text-center text-xs font-semibold text-slate-700"
              >
                Dashboard
              </Link>

              <Link
                href="/staff/incidents"
                className="rounded-lg bg-slate-100 px-2 py-2 text-center text-xs font-semibold text-slate-700"
              >
                Incidents
              </Link>

              <Link
                href="/staff/notifications"
                className="rounded-lg bg-slate-950 px-2 py-2 text-center text-xs font-semibold !text-white"
              >
                Alerts
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Response Staff
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Notifications
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Stay updated about assignments, incidents and alerts.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 sm:w-auto"
                >
                  Mark All as Read
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Summary */}
            <div className="mt-7 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">Total</p>

                <p className="mt-2 text-2xl font-bold">
                  {notifications.length}
                </p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
                <p className="text-xs text-red-600">Unread</p>

                <p className="mt-2 text-2xl font-bold text-red-700">
                  {unreadCount}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
                <p className="text-xs text-orange-600">Urgent</p>

                <p className="mt-2 text-2xl font-bold text-orange-700">
                  {urgentCount}
                </p>
              </div>
            </div>

            {/* Notifications */}
            <div className="mt-7 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm text-slate-500">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-700">
                    No notifications
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    You currently have no notifications.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                      notification.unread
                        ? "border-slate-300"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                          notificationStyles[notification.type] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {notification.type === "Critical Incident"
                          ? "!"
                          : notification.type === "SLA Warning"
                            ? "SLA"
                            : notification.type === "Escalation"
                              ? "↑"
                              : "•"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold">
                                {notification.title}
                              </h3>

                              {notification.unread && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                  NEW
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {notification.time}
                            </p>
                          </div>

                          <span
                            className={`self-start rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              notificationStyles[notification.type] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {notification.type}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {notification.message}
                        </p>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                          {notification.incidentId !== null && (
                            <Link
                              href={`/staff/incidents/${notification.incidentId}`}
                              onClick={() => markAsRead(notification.id)}
                              className="rounded-lg bg-black px-4 py-2.5 text-center text-xs font-semibold !text-white transition hover:bg-slate-800"
                            >
                              View Incident
                            </Link>
                          )}

                          {notification.unread && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification.id)}
                              className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Notification Info */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold">About Staff Alerts</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Notifications help response staff react quickly to new
                assignments and incident updates.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

