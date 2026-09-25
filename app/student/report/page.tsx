"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

type FormData = {
  title: string;
  description: string;
  location: string;
  category: string;
  severity: string;
  peopleAffected: string;
  affectedCount: string;
};

const initialForm: FormData = {
  title: "",
  description: "",
  location: "",
  category: "",
  severity: "",
  peopleAffected: "",
  affectedCount: "",
};

export default function ReportIncidentPage() {
  const [form, setForm] = useState<FormData>(initialForm);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [incidentId, setIncidentId] = useState("");
  const [incidentDbId, setIncidentDbId] = useState<number | null>(null);
  const [reportedAt, setReportedAt] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormData, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
      submit: "",
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = "Please enter an incident title.";
    }

    if (!form.description.trim()) {
      newErrors.description = "Please describe what happened.";
    } else if (form.description.trim().length < 15) {
      newErrors.description =
        "Please provide a little more detail about the incident.";
    }

    if (!form.location) {
      newErrors.location = "Please select the incident location.";
    }

    if (!form.category) {
      newErrors.category = "Please select an incident category.";
    }

    if (!form.severity) {
      newErrors.severity = "Please select the severity.";
    }

    if (!form.peopleAffected) {
      newErrors.peopleAffected =
        "Please indicate whether anyone is affected.";
    }

    if (
      form.peopleAffected === "yes" &&
      (!form.affectedCount || Number(form.affectedCount) < 1)
    ) {
      newErrors.affectedCount =
        "Please enter the number of people affected.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token =
      localStorage.getItem("campus_token") ||
      sessionStorage.getItem("campus_token");

    if (!token) {
      setErrors({
        submit: "Your session has expired. Please log in again.",
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/incidents/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            location: form.location,
            people_affected:
              form.peopleAffected === "yes"
                ? Number(form.affectedCount)
                : 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.detail === "string"
            ? data.detail
            : "Unable to submit the incident.";

        setErrors({
          submit: message,
        });

        return;
      }

      // Store the real database ID
      setIncidentDbId(data.id);

      // Display a user-friendly incident ID
      setIncidentId(`INC-${data.id}`);

      // Store submission time
      setReportedAt(
        new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      );

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Incident submission error:", error);

      setErrors({
        submit:
          "Unable to connect to the server. Please make sure the backend is running.",
      });
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setImage(null);
    setImagePreview(null);
    setSubmitted(false);
    setErrors({});
    setIncidentId("");
    setIncidentDbId(null);
    setReportedAt("");
  };

  if (submitted) {
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
                  className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium"
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

          {/* Success content */}
          <main className="flex-1">
            <header className="border-b border-slate-200 bg-white">
              <div className="px-6 py-5 lg:px-8">
                <p className="text-sm text-slate-500">Student Portal</p>
                <h2 className="text-2xl font-bold tracking-tight">
                  Report an Incident
                </h2>
              </div>
            </header>

            <div className="flex min-h-[calc(100vh-100px)] items-center justify-center p-6 lg:p-8">
              <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600">
                  ✓
                </div>

                <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-emerald-600">
                  Report Submitted
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  Incident reported successfully
                </h3>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">
                  Your incident has been recorded. The system will classify
                  the incident and route it to the appropriate campus response
                  team.
                </p>

                <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Incident ID
                      </p>

                      <p className="mt-1 text-lg font-bold text-blue-900">
                        {incidentId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Reported At
                      </p>

                      <p className="mt-1 text-sm font-semibold text-blue-900">
                        {reportedAt}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Category
                      </p>

                      <p className="mt-1 text-sm font-semibold text-blue-900">
                        {form.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Severity
                      </p>

                      <p className="mt-1 text-sm font-semibold text-blue-900">
                        {form.severity}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-semibold text-blue-900">
                        {form.location}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Status
                      </p>

                      <p className="mt-1 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        OPEN
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-blue-200 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Incident Title
                    </p>

                    <p className="mt-1 text-sm font-semibold text-blue-900">
                      {form.title}
                    </p>
                  </div>

                  <p className="mt-4 text-xs text-blue-700">
                    Keep this ID for tracking your incident.
                  </p>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href={
                      incidentDbId
                        ? `/student/incidents/${incidentDbId}`
                        : "/student/incidents"
                    }
                    className="rounded-xl bg-black px-6 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
                  >
                    View Incident
                  </Link>

                  <Link
                    href="/student"
                    className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back to Dashboard
                  </Link>

                  <button
                    onClick={handleReset}
                    className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Report Another
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium"
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

        {/* Main */}
        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="px-6 py-5 lg:px-8">
              <p className="text-sm text-slate-500">Student Portal</p>
              <h2 className="text-2xl font-bold tracking-tight">
                Report an Incident
              </h2>
            </div>
          </header>

          <div className="mx-auto max-w-5xl p-6 lg:p-8">
            {/* Page intro */}
            <div className="mb-8">
              <Link
                href="/student"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
              >
                ← Back to Dashboard
              </Link>

              <div className="mt-5">
                <h3 className="text-3xl font-bold tracking-tight">
                  Tell us what happened
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Provide as much accurate information as possible. This helps
                  the campus response team understand the situation and react
                  quickly.
                </p>
              </div>
            </div>

            {/* Emergency warning */}
            <div className="mb-6 flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div>
                <h4 className="font-semibold text-red-800">
                  Is this an immediate emergency?
                </h4>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  If there is immediate danger to life or serious injury,
                  contact campus emergency services directly first. Use this
                  form to create a formal incident record.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Incident information */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                      1
                    </div>

                    <div>
                      <h4 className="text-lg font-bold">
                        Incident Information
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Basic details about the incident.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Incident Title <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="title"
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        updateField("title", e.target.value)
                      }
                      placeholder="e.g. Smoke coming from electrical panel"
                      className={`w-full rounded-xl border ${
                        errors.title
                          ? "border-red-400"
                          : "border-slate-200"
                      } bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white`}
                    />

                    {errors.title && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      id="description"
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      rows={6}
                      placeholder="Describe what happened, what you observed, and any other useful details..."
                      className={`w-full resize-none rounded-xl border ${
                        errors.description
                          ? "border-red-400"
                          : "border-slate-200"
                      } bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white`}
                    />

                    <div className="mt-2 flex justify-between">
                      {errors.description ? (
                        <p className="text-xs text-red-600">
                          {errors.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Be specific about what you saw.
                        </p>
                      )}

                      <p className="text-xs text-slate-400">
                        {form.description.length} characters
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Location <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="location"
                      value={form.location}
                      onChange={(e) =>
                        updateField("location", e.target.value)
                      }
                      className={`w-full rounded-xl border ${
                        errors.location
                          ? "border-red-400"
                          : "border-slate-200"
                      } bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
                    >
                      <option value="">Select location</option>
                      <option value="Block A">Block A</option>
                      <option value="Block B">Block B</option>
                      <option value="Block C">Block C</option>
                      <option value="Library">Library</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Sports Ground">Sports Ground</option>
                      <option value="Hostel">Hostel</option>
                      <option value="Main Gate">Main Gate</option>
                      <option value="Cafeteria">Cafeteria</option>
                      <option value="Parking Area">Parking Area</option>
                      <option value="Other">Other</option>
                    </select>

                    {errors.location && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Category <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) =>
                        updateField("category", e.target.value)
                      }
                      className={`w-full rounded-xl border ${
                        errors.category
                          ? "border-red-400"
                          : "border-slate-200"
                      } bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
                    >
                      <option value="">Select category</option>
                      <option value="Fire">🔥 Fire</option>
                      <option value="Medical">⚕ Medical</option>
                      <option value="Electrical">⚡ Electrical</option>
                      <option value="Water">💧 Water</option>
                      <option value="Infrastructure">
                        🏗 Infrastructure
                      </option>
                      <option value="IT">💻 IT</option>
                      <option value="Security">🛡 Security</option>
                      <option value="Other">Other</option>
                    </select>

                    {errors.category && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Severity */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-600">
                      2
                    </div>

                    <div>
                      <h4 className="text-lg font-bold">
                        Severity & Impact
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Help us understand how serious the situation is.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {/* Severity cards */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                      How severe is the incident?{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <SeverityOption
                        value="Low"
                        selected={form.severity === "Low"}
                        title="Low"
                        description="Minor issue"
                        onClick={() => updateField("severity", "Low")}
                      />

                      <SeverityOption
                        value="Medium"
                        selected={form.severity === "Medium"}
                        title="Medium"
                        description="Needs attention"
                        onClick={() => updateField("severity", "Medium")}
                      />

                      <SeverityOption
                        value="High"
                        selected={form.severity === "High"}
                        title="High"
                        description="Urgent response"
                        onClick={() => updateField("severity", "High")}
                      />

                      <SeverityOption
                        value="Critical"
                        selected={form.severity === "Critical"}
                        title="Critical"
                        description="Immediate danger"
                        onClick={() => updateField("severity", "Critical")}
                      />
                    </div>

                    {errors.severity && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.severity}
                      </p>
                    )}
                  </div>

                  {/* People affected */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                      Is anyone affected?{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateField("peopleAffected", "yes")
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          form.peopleAffected === "yes"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-sm font-semibold">Yes</p>
                        <p className="mt-1 text-xs text-slate-500">
                          One or more people are affected
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateField("peopleAffected", "no")
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          form.peopleAffected === "no"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-sm font-semibold">No</p>
                        <p className="mt-1 text-xs text-slate-500">
                          No one is currently affected
                        </p>
                      </button>
                    </div>

                    {errors.peopleAffected && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.peopleAffected}
                      </p>
                    )}
                  </div>

                  {/* Affected count */}
                  {form.peopleAffected === "yes" && (
                    <div className="max-w-sm">
                      <label
                        htmlFor="affectedCount"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Approximate number of people affected{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="affectedCount"
                        type="number"
                        min="1"
                        value={form.affectedCount}
                        onChange={(e) =>
                          updateField("affectedCount", e.target.value)
                        }
                        placeholder="e.g. 3"
                        className={`w-full rounded-xl border ${
                          errors.affectedCount
                            ? "border-red-400"
                            : "border-slate-200"
                        } bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
                      />

                      {errors.affectedCount && (
                        <p className="mt-2 text-xs text-red-600">
                          {errors.affectedCount}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Image upload */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 font-bold text-purple-600">
                      3
                    </div>

                    <div>
                      <h4 className="text-lg font-bold">
                        Supporting Evidence
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Optionally attach an image that helps explain the
                        incident.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {!imagePreview ? (
                    <label
                      htmlFor="image"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-300 hover:bg-blue-50/30"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                        📷
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        Upload an image
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        PNG, JPG or JPEG · Optional
                      </p>

                      <input
                        id="image"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <img
                          src={imagePreview}
                          alt="Incident preview"
                          className="h-40 w-full rounded-xl object-cover sm:w-56"
                        />

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {image?.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Image attached to this report.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={removeImage}
                            className="mt-4 self-start rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* AI notice */}
              <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    AI
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-900">
                      AI-assisted incident classification
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      After submission, the platform will analyze the incident
                      details and suggest a category and priority. A campus
                      coordinator will review the recommendation before the
                      response workflow continues.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700">
                        Category
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700">
                        Priority
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700">
                        Confidence
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Submission error */}
              {errors.submit && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {errors.submit}
                </div>
              )}

              {/* Submit */}
              <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Ready to submit?
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Please make sure the information above is accurate.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/student"
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Submit Incident
                  </button>
                </div>
              </section>
            </form>

            <footer className="py-8 text-center text-xs text-slate-400">
              Campus Incident Management & Emergency Response Platform
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Severity Option ---------- */

function SeverityOption({
  value,
  selected,
  title,
  description,
  onClick,
}: {
  value: string;
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
          : "border-slate-200 bg-slate-50 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>

        {selected && (
          <span className="text-sm font-bold text-blue-600">✓</span>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </button>
  );
}