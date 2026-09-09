import Link from "next/link";

export default function PlaygroundPage() {
  return (
    <main className="lab-grid min-h-screen bg-[#06101d] text-slate-100">
      <header className="border-b border-white/[.07] bg-[#06101d]/85 px-5 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-300 text-lg text-slate-950">◈</span>
            qubit<span className="text-cyan-300">lab</span>
          </Link>
          <Link href="/learn" className="text-sm text-slate-400 transition hover:text-cyan-200">← Back to learning</Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[1600px] flex-col px-4 py-7 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Advanced laboratory</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Quantum Circuit Playground</h1>
            <p className="mt-2 text-sm text-slate-400">Build and experiment with quantum circuits.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-cyan-200/15 bg-white shadow-[0_24px_80px_rgba(0,0,0,.35)]">
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
