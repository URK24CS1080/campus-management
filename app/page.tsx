"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const roles = [
  {
    id: "student",
    label: "Student",
    icon: "🎓",
    description: "Report and track incidents",
  },
  {
    id: "coordinator",
    label: "Coordinator",
    icon: "📋",
    description: "Manage and monitor incidents",
  },
  {
    id: "staff",
    label: "Response Staff",
    icon: "🛠️",
    description: "Respond to assigned incidents",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left side */}
        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-xl">
              🚨
            </div>

            <div>
              <p className="font-bold">Campus Incident</p>
              <p className="text-xs text-slate-400">
                Emergency Response Platform
              </p>
            </div>
          </Link>

          <div className="max-w-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/10 text-3xl ring-1 ring-red-500/20">
              🛡️
            </div>

            <h1 className="text-4xl font-extrabold leading-tight">
              One platform for a
              <span className="block text-red-500">safer campus.</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Report incidents, coordinate response teams and keep track of
              every incident from the moment it is reported until it is
              resolved.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "AI-assisted incident classification",
                "Real-time incident tracking",
                "SLA monitoring and escalation",
                "Complete incident history",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
                    ✓
                  </span>

                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Campus Safety Management System
          </p>
        </section>

        {/* Right side */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-10 lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg text-white">
                  🚨
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Campus Incident
                  </p>
                  <p className="text-xs text-slate-500">
                    Emergency Response Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Heading */}
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Select your role and enter your campus credentials.
              </p>
            </div>

            {/* Role selection */}
            <div className="mt-8">
              <label className="text-sm font-bold text-slate-700">
                I am a
              </label>

              <div className="mt-3 grid gap-3">
                {roles.map((role) => {
                  const isSelected = selectedRole === role.id;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-red-500 bg-red-50 ring-2 ring-red-500/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl ${
                          isSelected ? "bg-red-100" : "bg-slate-100"
                        }`}
                      >
                        {role.icon}
                      </div>

                      <div className="flex-1">
                        <p
                          className={`text-sm font-bold ${
                            isSelected
                              ? "text-red-700"
                              : "text-slate-900"
                          }`}
                        >
                          {role.label}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {role.description}
                        </p>
                      </div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-red-600 bg-red-600"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <span className="text-xs text-white">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login form */}
            <form
              className="mt-7 space-y-5"
              onSubmit={async (event) => {
  event.preventDefault();

  setError("");
  setLoading(true);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem("campus_token", data.access_token);
    storage.setItem("campus_role", selectedRole);
    storage.setItem("campus_email", email);

    if (selectedRole === "student") {
      router.push("/student");
    } else if (selectedRole === "coordinator") {
      router.push("/coordinator");
    } else if (selectedRole === "staff") {
      router.push("/staff");
    }
  } catch (error) {
    console.error("Login failed:", error);
    setError(
      error instanceof Error
        ? error.message
        : "Unable to login. Please try again."
    );
  } finally {
    setLoading(false);
  }
}}
            >
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-bold text-slate-700"
                >
                  Campus Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {error}
  </div>
)}

              <label className="flex items-center gap-2">
                <input
                 type="checkbox"
                 checked={rememberMe}
                 onChange={(event) => setRememberMe(event.target.checked)}
                 className="h-4 w-4 rounded border-slate-300 accent-red-600"
                />

                <span className="text-xs text-slate-500">
                  Remember me on this device
                </span>
              </label>

              <button
  type="submit"
  disabled={loading}
  className="w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Signing In..." : "Sign In →"}
</button>
            </form>

            {/* Emergency reporting */}
            <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <span className="text-lg">⚠️</span>

                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Immediate danger?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    For immediate emergencies, contact campus security or
                    emergency services directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="mt-7 text-center">
              <Link
                href="/"
                className="text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}