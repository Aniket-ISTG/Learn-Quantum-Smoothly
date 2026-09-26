import { PlatformHeader } from "@/components/platform/header";

const stats = [
  { label: "Lessons completed", value: 0, total: 12 },
  { label: "Lessons started", value: 0, total: 12 },
  { label: "Practice sessions", value: 0, total: 20 },
  { label: "Overall progress", value: 0, total: 100, suffix: "%" },
];

export default function ProgressPage() {
  return (
    <>
      <PlatformHeader />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#fff,_#f8fafc)] px-4 py-10 text-slate-800">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 rounded-3xl border border-orange-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
              Progress tracker
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Your learning progress
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
              A simple snapshot of your quantum learning journey. Everything starts at zero and updates as you move forward.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">{stat.label}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-mono text-3xl font-bold text-slate-900">
                    {stat.value}
                  </span>
                  {stat.total ? (
                    <span className="pb-1 text-sm text-slate-400">
                      / {stat.total}
                      {stat.suffix ?? ""}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-orange-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
                    style={{ width: `${(stat.value / Math.max(stat.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Current status</h2>
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                0% complete
              </span>
            </div>

            <div className="space-y-4">
              {[
                "Math foundations",
                "Quantum basics",
                "Circuit design",
                "Advanced concepts",
              ].map((label) => (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm text-slate-600">
                    <span>{label}</span>
                    <span>0%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
