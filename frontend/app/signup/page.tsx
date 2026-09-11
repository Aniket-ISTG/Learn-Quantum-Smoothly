"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/quantum/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created successfully!");
    router.push("/login");
  };

  return (
    <main className="lab-grid aurora min-h-screen bg-[#f8fbff] text-slate-900 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 h-16 border-b border-cyan-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-16">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 font-bold text-slate-900"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
            ◈
          </div>
          <span>
            qubit<span className="gradient-text">lab</span>
          </span>
        </button>

        <button
          onClick={() => router.push("/")}
          className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition"
        >
          Back to home →
        </button>
      </header>

      {/* Signup section */}
      <section className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-200/80 bg-cyan-50 text-cyan-700 text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Quantum learning laboratory
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
              Start learning.
            </h1>

            <p className="text-sm text-slate-600">
              Create your account and enter Qubit Lab.
            </p>
          </div>

          {/* Signup card */}
          <div className="panel rounded-3xl p-7 md:p-8 bg-white shadow-[0_8px_32px_rgba(6,182,212,0.08)] border border-cyan-100">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-200"
                />
              </div>

              {/* Signup button */}
              <button
                type="submit"
                className="btn-primary w-full justify-center !py-3 !text-sm mt-2"
              >
                Create account →
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-cyan-100 flex-1" />
              <span className="text-[11px] font-bold text-slate-400">OR</span>
              <div className="h-px bg-cyan-100 flex-1" />
            </div>

            {/* Google button */}
            <button
              type="button"
              className="btn-secondary w-full justify-center !py-2.5 !text-sm"
            >
              Continue with Google
            </button>

            {/* Login */}
            <p className="text-center text-xs text-slate-600 mt-5">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-cyan-600 font-bold hover:underline"
              >
                Login
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Learn Quantum Smoothly · Qubit Lab
          </p>
        </div>
      </section>
    </main>
  );
}