import Link from "next/link";
import { PlatformHeader } from "@/components/platform/header";

const pillars = [
  {
    title: "Interactive learning",
    text: "Move from concepts to hands-on practice with lessons that explain the idea and immediately let you apply it.",
    icon: "✦",
  },
  {
    title: "Quantum circuit playground",
    text: "Experiment with gates, qubits, and circuit logic in a visual environment made for discovery and intuition.",
    icon: "◌",
  },
  {
    title: "Built for progression",
    text: "Track your milestones, see your momentum, and keep learning with a path that grows as your understanding does.",
    icon: "↗",
  },
];

function QubitVisual() {
  return (
    <div className="relative flex h-[320px] w-full max-w-[420px] items-center justify-center">
      <div className="absolute inset-6 rounded-full border border-orange-200/70 bg-[radial-gradient(circle,_rgba(255,247,237,0.9),_rgba(255,255,255,0.2)_60%,_transparent_100%)]" />
      <div className="absolute h-[230px] w-[230px] rounded-full border border-orange-200/80 animate-[spin_18s_linear_infinite]" />
      <div className="absolute h-[230px] w-[230px] rounded-full border border-amber-200/80 animate-[spin_12s_linear_infinite_reverse]" />
      <div className="absolute h-[170px] w-[170px] rounded-full border border-orange-100" />
      <div className="absolute h-[14px] w-[14px] rounded-full bg-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.8)]" />
      <div className="absolute h-[120px] w-[2px] origin-bottom bg-gradient-to-t from-orange-500 via-amber-400 to-transparent rotate-[38deg] shadow-[0_0_18px_rgba(251,146,60,0.8)]" />
      <div className="absolute h-[120px] w-[2px] origin-bottom bg-gradient-to-t from-amber-300 via-orange-400 to-transparent -rotate-[38deg] shadow-[0_0_18px_rgba(253,186,116,0.8)]" />
      <div className="absolute h-[90px] w-[90px] rounded-full border border-dashed border-orange-200/80" />
      <div className="absolute inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600 shadow-sm">
        QUANTUM STATE
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <PlatformHeader />
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fffaf5,_#ffffff,_#f8fafc)] px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="overflow-hidden rounded-[32px] border border-orange-100 bg-white/80 shadow-[0_25px_90px_rgba(251,146,60,0.10)] backdrop-blur-sm">
            <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-12">
            <div>
              <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-600">
                Learn quantum with clarity
              </span>

              <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Build intuition for quantum computing.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                This project combines guided lessons, a circuit playground, and an IDE-like environment so you can move from theory to experimentation without losing momentum.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/learn"
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(249,115,22,0.25)] transition hover:translate-y-[-1px] hover:opacity-95"
                >
                  Start your journey →
                </Link>
                <Link
                  href="/progress"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-600"
                >
                  View progress
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  { value: "3", label: "core learning modes" },
                  { value: "∞", label: "ways to experiment" },
                  { value: "0%", label: "starting point" },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3">
                    <div className="font-mono text-xl font-bold text-slate-900">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-100/80 via-amber-50/50 to-transparent blur-3xl" />
              <div className="relative w-full max-w-md rounded-[30px] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 shadow-inner">
                <QubitVisual />
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    <span>Progress</span>
                    <span className="text-orange-600">0%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </section>

          <section className="mt-12">
            <div className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                Why it helps
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                A smarter way to learn quantum concepts
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map(({ title, text, icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-orange-100 text-lg text-orange-600 shadow-sm">
                    {icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
