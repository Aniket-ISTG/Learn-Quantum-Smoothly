import type { QuantumState } from "@/types/quantum";

export function ProbabilityDistribution({ state, limit = 4 }: { state: QuantumState; limit?: number }) {
  return <div className="space-y-3">{state.basisStates.slice(0, limit).map((basis, index) => <div key={basis}><div className="mb-1.5 flex justify-between font-mono text-xs"><span className="text-slate-400">{basis}</span><b className="text-slate-100">{Math.round(state.probabilities[index] * 100)}%</b></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all duration-500" style={{ width: `${state.probabilities[index] * 100}%` }}/></div></div>)}</div>;
}
