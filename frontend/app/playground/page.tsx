import Link from "next/link";
import { PlatformHeader } from "@/components/platform/header";

export default function PlaygroundPage() {
  return (
    <main className="lab-grid min-h-screen bg-[#f8fbff] text-slate-900">
      <PlatformHeader />

      <section className="mx-auto flex w-full max-w-[1600px] flex-col px-4 py-7 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">
              Advanced laboratory
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Quantum Circuit Playground
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Build and experiment with quantum circuits.
            </p>
          </div>
          <Link href="/" className="btn-secondary !text-xs">
            ← Back to home
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-[0_8px_32px_rgba(6,182,212,0.08)]">
          <iframe
            className="block h-[calc(100vh-224px)] min-h-[680px] w-full border-0"
            src="/quirk-e/index.html"
            title="Quirk-E quantum circuit simulator"
            sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
          />
        </div>
      </section>
    </main>
  );
}
