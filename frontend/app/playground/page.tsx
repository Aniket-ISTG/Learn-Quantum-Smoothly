"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { PlatformHeader } from "@/components/platform/header";

const QuirkCircuit = dynamic(
  () => import("@/components/quantum/quirk-circuit").then((mod) => mod.QuirkCircuit),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[680px] w-full items-center justify-center bg-white text-slate-500">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-sm font-medium">Loading Quantum Playground...</p>
        </div>
      </div>
    ),
  }
);

export default function PlaygroundPage() {
  const [quirkReloadKey, setQuirkReloadKey] = useState(0);
  const [isQuirkLoading, setIsQuirkLoading] = useState(false);

  const handleAdvancedGatesChange = () => {
    setIsQuirkLoading(true);
    setTimeout(() => {
      setQuirkReloadKey((value) => value + 1);
    }, 0);
  };

  return (
    <main className="lab-grid min-h-screen w-full max-w-full overflow-x-hidden bg-[#f8fbff] text-slate-900">
      <PlatformHeader />

      <section className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-col px-4 py-7 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">
              Advanced laboratory
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Quantum Circuit Playground
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Build and experiment with quantum circuits in real-time.
            </p>
          </div>

          <Link href="/" className="btn-secondary !text-xs">
            ← Back to home
          </Link>
        </div>

        <div className="relative w-full min-w-0 max-w-full overflow-visible rounded-2xl border border-cyan-100 bg-white shadow-[0_8px_32px_rgba(6,182,212,0.08)]">
          {isQuirkLoading && (
            <div className="absolute inset-0 z-50 flex h-[680px] items-center justify-center bg-white/90 text-slate-500 backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                <p className="text-sm font-medium">Loading Quantum Playground...</p>
              </div>
            </div>
          )}

          <QuirkCircuit
            key={quirkReloadKey}
            onAdvancedGatesChanged={handleAdvancedGatesChange}
            onReady={() => setIsQuirkLoading(false)}
          />
        </div>
      </section>
    </main>
  );
}