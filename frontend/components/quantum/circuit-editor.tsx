"use client";

import dynamic from "next/dynamic";

export const QuirkCircuit = dynamic(
  () => import("./quirk-circuit").then((mod) => mod.QuirkCircuit),
  { ssr: false }
);

export function CircuitEditor({ initialCircuit }: { initialCircuit?: string }) {
  return (
    <div className="w-full rounded-2xl border border-cyan-100 overflow-hidden bg-white shadow-md">
      <QuirkCircuit initialCircuit={initialCircuit} />
    </div>
  );
}
