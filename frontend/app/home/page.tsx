import Link from "next/link";
import { PlatformHeader } from "@/components/platform/header";

const learningFlow = [
  {
    step: "01",
    title: "Learn the foundations",
    text: "Start with quantum basics, math intuition, and key ideas like superposition, interference, and measurement.",
  },
  {
    step: "02",
    title: "Visualize the behavior",
    text: "Use the circuit simulator to see how gates affect qubits and how results change as you build the circuit.",
  },
  {
    step: "03",
    title: "Practice in the IDE",
    text: "Move from learning to experimentation with coding workflows and lab-style problem solving in a focused environment.",
  },
  {
    step: "04",
    title: "Track your progress",
    text: "Continue from where you left off and measure how far you have come through your learning path.",
  },
];

const simulatorFeatures = [
  "Build and edit quantum circuits visually",
  "Explore gate behavior with instant feedback",
  "Inspect probabilities and state changes",
  "Learn by experimenting instead of memorizing",
  "Test ideas quickly and compare outcomes",
];

const ideCapabilities = [
  "Work in a code-focused quantum environment",
  "Move from concept to implementation smoothly",
  "Support structured lab-style experimentation",
  "Bridge learning material with practical exploration",
  "Build confidence with a hands-on workflow",
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
                  This platform combines guided theory, a visual circuit laboratory, and a practical coding environment so you can move from concepts to experiments without losing momentum.
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
                    { value: "3", label: "learning modes" },
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

          <section className="mt-12 rounded-[30px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">How learning is structured</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">A guided pathway from theory to experimentation</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {learningFlow.map(({ step, title, text }) => (
                <div key={step} className="group rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-4 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 shadow-sm">
                    {step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Simulator</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">What you can do with the circuit simulator</h3>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-xl text-orange-600 shadow-sm">
                  ◌
                </div>
              </div>

              <div className="space-y-3">
                {simulatorFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 rounded-2xl border border-orange-50 bg-orange-50/40 p-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm text-orange-600 shadow-sm">✓</span>
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">IDE</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">What the IDE supports</h3>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-xl text-amber-600 shadow-sm">
                  ⌘
                </div>
              </div>

              <div className="space-y-3">
                {ideCapabilities.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 rounded-2xl border border-amber-50 bg-amber-50/40 p-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm text-amber-600 shadow-sm">✦</span>
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-16 rounded-[30px] border border-orange-100 bg-gradient-to-br from-white via-orange-50/60 to-amber-50 p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Why this works</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Concepts become visible, testable, and memorable</h2>
                <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                  Instead of reading about quantum rules in isolation, you see them unfold in real time. That makes the learning process feel active, visual, and practical from the very beginning.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/learn" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Explore lessons
                  </Link>
                  <Link href="/playground" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-600">
                    Open simulator
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-orange-200/30 to-transparent blur-2xl" />
                <div className="relative rounded-[28px] border border-orange-100 bg-white p-5 shadow-[0_20px_60px_rgba(251,146,60,0.10)]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Learning loop</span>
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-600">Live</span>
                  </div>

                  <div className="space-y-4">
                    {["Understand", "Build", "Observe", "Improve"].map((label, index) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-amber-400 text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-orange-200 via-amber-200 to-transparent" />
                        <div className="text-sm font-semibold text-slate-700">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
