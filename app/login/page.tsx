"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "student" | "coordinator" | "staff";

const roles = [
  {
    id: "student" as Role,
    title: "Student",
    description: "Report and track incidents",
    icon: "🎓",
  },
  {
    id: "coordinator" as Role,
    title: "Coordinator",
    description: "Manage and monitor incidents",
    icon: "📋",
  },
  {
    id: "staff" as Role,
    title: "Response Staff",
    description: "Respond to assigned incidents",
    icon: "🛠️",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email settings change according to selected role
  const emailConfig = {
    student: {
      placeholder: "you@college.edu.in",
      domain: "@college.edu.in",
    },
    coordinator: {
      placeholder: "you@college.edu",
      domain: "@college.edu",
    },
    staff: {
      placeholder: "you@college.edu",
      domain: "@college.edu",
    },
  };

  const currentEmailConfig = emailConfig[role];

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);

    // Clear previous credentials when role changes
    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");

  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password.trim()) {
    setError("Please enter your email and password.");
    return;
  }

  // Validate email according to selected role
  if (role === "student") {
    if (!trimmedEmail.endsWith("@college.edu.in")) {
      setError(
        "Students must use a valid college email ending with @college.edu.in."
      );
      return;
    }
  } else {
    if (!trimmedEmail.endsWith("@college.edu")) {
      setError(
        `${
          role === "coordinator" ? "Coordinators" : "Response staff"
        } must use a valid college email ending with @college.edu.`
      );
      return;
    }
  }

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
          email: trimmedEmail,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.detail || "Invalid email or password.");
      return;
    }

    // Store authentication information
    if (rememberMe) {
      localStorage.setItem("campus_token", data.access_token);
      localStorage.setItem("campus_remember_me", "true");
    } else {
      sessionStorage.setItem("campus_token", data.access_token);
      localStorage.removeItem("campus_remember_me");
    }

    localStorage.setItem("campus_role", role);
    localStorage.setItem("campus_email", trimmedEmail);

    // Redirect according to selected role
    if (role === "student") {
      router.push("/student");
    } else if (role === "coordinator") {
      router.push("/coordinator");
    } else {
      router.push("/staff");
    }
  } catch (error) {
    console.error("Login error:", error);
    setError(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden bg-[#020617] px-12 py-12 text-white lg:flex lg:flex-col">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-2xl shadow-lg">
              🚨
            </div>

            <div>
              <h1 className="text-xl font-bold">Campus Incident</h1>
              <p className="text-sm text-blue-200">
                Emergency Response Platform
              </p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="my-auto max-w-xl">

            <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-900/60 bg-red-950/30 text-4xl">
              🛡️
            </div>

            <h2 className="text-5xl font-extrabold leading-tight">
              One platform for a{" "}
              <span className="text-red-500">safer campus.</span>
            </h2>

            <p className="mt-8 text-xl leading-9 text-blue-200">
              Report incidents, coordinate response teams and keep track of
              every incident from the moment it is reported until it is
              resolved.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "AI-assisted incident classification",
                "Real-time incident tracking",
                "SLA monitoring and escalation",
                "Complete incident history",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-950 text-sm text-emerald-400">
                    ✓
                  </span>

                  <span className="text-base text-blue-100">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-blue-300">
            Campus Safety Management System
          </p>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

          <div className="w-full max-w-xl">

            {/* Heading */}
            <div className="mb-10">
              <p className="text-sm font-bold tracking-[0.18em] text-red-600">
                WELCOME BACK
              </p>

              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
                Sign in to your account
              </h2>

              <p className="mt-4 text-base text-slate-500">
                Select your role and enter your campus credentials.
              </p>
            </div>

            <form onSubmit={handleLogin}>

              {/* ROLE SELECTION */}
              <div>
                <label className="text-sm font-bold text-slate-900">
                  I am a
                </label>

                <div className="mt-4 space-y-4">

                  {roles.map((item) => {
                    const selected = role === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleRoleChange(item.id)}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                          selected
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >

                        <span
                          className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${
                            selected ? "bg-red-100" : "bg-slate-100"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span className="flex-1">

                          <span
                            className={`block text-base font-bold ${
                              selected
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                          >
                            {item.title}
                          </span>

                          <span className="mt-1 block text-sm text-slate-500">
                            {item.description}
                          </span>

                        </span>

                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            selected
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && "✓"}
                        </span>

                      </button>
                    );
                  })}

                </div>
              </div>

              {/* EMAIL */}
              <div className="mt-9">

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="email"
                    className="text-sm font-bold text-slate-900"
                  >
                    Campus Email
                  </label>

                  <span className="text-xs font-medium text-slate-400">
                    {role === "student"
                      ? "Student email"
                      : "Official campus email"}
                  </span>
                </div>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentEmailConfig.placeholder}
                  autoComplete="email"
                  className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Use an email ending with{" "}
                  <span className="font-semibold text-slate-500">
                    {currentEmailConfig.domain}
                  </span>
                </p>

              </div>

              {/* PASSWORD */}
              <div className="mt-6">

                <div className="flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-bold text-slate-900"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                    onClick={() =>
                      alert("Password reset will be added later.")
                    }
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative mt-3">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-20 text-base outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-slate-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>
              </div>

              {/* REMEMBER ME */}
              <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-slate-500">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-red-600"
                />

                Remember me on this device

              </label>

              {/* ERROR */}
              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-2xl bg-red-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing In..." : "Sign In →"}
              </button>

            </form>

            {/* SIGN UP */}
            <div className="mt-7 text-center text-sm text-slate-500">

              Don&apos;t have an account?{" "}

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="font-bold text-red-600 hover:text-red-700"
              >
                Create an account
              </button>

            </div>

            {/* EMERGENCY NOTICE */}
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">

              <div className="flex gap-4">

                <span className="text-xl">⚠️</span>

                <div>

                  <h3 className="font-bold text-amber-900">
                    Immediate danger?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    For immediate emergencies, contact campus security or
                    emergency services directly.
                  </p>

                </div>

              </div>

            </div>

            {/* DEMO CREDENTIALS */}
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

              <p className="text-sm font-bold text-blue-900">
                Demo credentials
              </p>

              <p className="mt-2 text-xs leading-5 text-blue-700">
                Student: student@college.edu.in
                <br />
                Coordinator: coordinator@college.edu
                <br />
                Response Staff: staff@college.edu
                <br />
                Password: 123456
              </p>

            </div>

            {/* BACK TO HOME */}
            <div className="mt-8 text-center">

              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-sm font-bold text-slate-900 hover:text-red-600"
              >
                ← Back to home
              </button>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}