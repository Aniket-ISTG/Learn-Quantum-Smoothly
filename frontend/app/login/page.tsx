"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/quantum/supabase";
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  router.push("/");
};

  return (
    <main className="min-h-screen bg-[#050d18] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-400/10 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 h-16 border-b border-white/10 flex items-center justify-between px-6 md:px-16">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center text-black font-bold">
            ◈
          </div>

          <span className="font-semibold text-lg">
            qubit <span className="text-cyan-400">lab</span>
          </span>
        </button>

        <button
          onClick={() => router.push("/")}
          className="text-sm text-slate-400 hover:text-white transition"
        >
          Back to home →
        </button>
      </header>

      {/* Login section */}
      <section className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-xs mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Quantum learning laboratory
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
              Welcome back.
            </h1>

            <p className="text-slate-400">
              Continue your quantum learning journey.
            </p>
          </div>

          {/* Login card */}
          <div className="border border-slate-700/60 bg-[#091523]/80 backdrop-blur-xl rounded-2xl p-7 md:p-8 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-slate-300 mb-2"
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
                  className="w-full rounded-lg border border-slate-700 bg-[#07111e] px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm text-slate-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-[#07111e] px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                />
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="w-full rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-3 transition"
              >
                Login →
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-slate-700/70 flex-1" />
              <span className="text-xs text-slate-500">OR</span>
              <div className="h-px bg-slate-700/70 flex-1" />
            </div>

            {/* Google button - UI only for now */}
            <button
              type="button"
              className="w-full rounded-lg border border-slate-700 hover:border-slate-500 bg-transparent py-3 text-sm font-medium text-slate-200 transition"
            >
              Continue with Google
            </button>

            {/* Signup */}
            <p className="text-center text-sm text-slate-400 mt-6">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition"
              >
                Sign up
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            Learn Quantum Smoothly · Qubit Lab
          </p>
        </div>
      </section>
    </main>
  );
}