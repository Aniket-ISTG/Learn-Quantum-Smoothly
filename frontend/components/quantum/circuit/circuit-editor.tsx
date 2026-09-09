"use client";

import { useMemo, useRef, useState } from "react";
import { simulateCircuit } from "@/lib/quantum/simulator";
import type { CircuitGate, GateType, QuantumCircuit } from "@/types/quantum";
import { ProbabilityDistribution } from "@/components/quantum/visualization/probability-distribution";

const palette: GateType[] = ["H", "X", "Y", "Z", "S", "T", "RX", "RY", "RZ", "CNOT", "MEASURE"];
const starter: QuantumCircuit = { qubits: 2, moments: [[{ id: "h-0", type: "H", target: 0 }], [{ id: "cnot-0", type: "CNOT", control: 0, target: 1 }]] };
const clone = (circuit: QuantumCircuit): QuantumCircuit => ({ ...circuit, moments: circuit.moments.map(moment => moment.map(gate => ({ ...gate }))) });

export function CircuitEditor({ compact = false }: { compact?: boolean }) {
  const [circuit, setCircuit] = useState<QuantumCircuit>(starter)
  const [history, setHistory] = useState<QuantumCircuit[]>([])
  const [future, setFuture] = useState<QuantumCircuit[]>([])
  const [step, setStep] = useState<number | null>(null);
  const nextGateId = useRef(1);
  const result = useMemo(() => simulateCircuit(circuit), [circuit]); 
  const display = step === null ? result.finalState : result.executionSteps[step]?.state ?? result.finalState;
  const change = (next: QuantumCircuit) => { 
    setHistory(old => [...old, clone(circuit)]); 
    setFuture([]); 
    setCircuit(next); 
    setStep(null); 
  };
  const addGate = (type: GateType) => { 
    const target = type === "CNOT" ? 1 : 0; 
    const gate: CircuitGate = {  
      id: `${type}-${nextGateId.current++}`, 
      type, 
      target, 
      ...(type === "CNOT" ? { control: 0 } : {}), 
      ...(type.startsWith("R") ? { parameter: Math.PI / 2 } : {})
    }; 
    change({ ...circuit, moments: [...circuit.moments, [gate]] }); 
  };
  const undo = () => { 
    const previous = history.at(-1); 
    if (!previous) return; 
    setFuture(old => [clone(circuit), ...old]); 
    setCircuit(previous); 
    setHistory(old => old.slice(0, -1)); 
    setStep(null); 
  };
  const redo = () => { 
    const next = future[0]; 
    if (!next) return; 
    setHistory(old => [...old, clone(circuit)]); setCircuit(next); 
    setFuture(old => old.slice(1)); setStep(null); 
  };
  const remove = (momentIndex: number, gateIndex: number) => {
    change({ ...circuit, 
      moments: circuit.moments.map((moment, i) => i === momentIndex ? 
      moment.filter((_, j) => j !== gateIndex) : moment).filter(moment => moment.length) });
  }
    return <div className={compact ? "" : "grid gap-5 lg:grid-cols-[210px_1fr_280px]"}><aside className="panel rounded-2xl p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Gate palette</p><div className="mt-4 grid grid-cols-2 gap-2">{palette.map(gate => <button key={gate} onClick={() => addGate(gate)} className="rounded-lg border border-white/10 bg-white/[.03] p-3 font-mono text-sm text-cyan-100 hover:border-cyan-300/50 hover:bg-cyan-300/10">{gate}</button>)}</div><div className="mt-4 flex gap-3 text-xs"><button onClick={undo} disabled={!history.length} className="text-slate-400 disabled:opacity-30">↶ Undo</button><button onClick={redo} disabled={!future.length} className="text-slate-400 disabled:opacity-30">Redo ↷</button><button onClick={() => change({ qubits: 2, moments: [] })} className="ml-auto text-slate-400">Clear</button></div></aside><div className="panel min-h-[380px] rounded-2xl p-6"><div className="flex items-center justify-between"><span className="text-sm font-semibold">Circuit canvas</span><span className="font-mono text-[10px] text-slate-500">{circuit.qubits} QUBITS</span></div><div className="mt-14 space-y-16">{Array.from({ length: circuit.qubits }, (_, qubit) => <div key={qubit} className="relative flex items-center gap-6"><span className="w-7 font-mono text-sm text-slate-500">q{qubit}</span><div className="absolute left-12 right-0 h-px bg-slate-500/40"/><div className="relative flex min-h-12 gap-3">{circuit.moments.map((moment, momentIndex) => moment.map((gate, gateIndex) => gate.target === qubit || gate.control === qubit ? <button key={gate.id} onClick={() => remove(momentIndex, gateIndex)} title="Remove gate" className={`grid h-12 w-12 place-items-center border font-mono text-sm ${gate.type === "CNOT" && gate.control === qubit ? "rounded-full border-violet-300 bg-violet-400 text-slate-950" : "rounded-lg border-cyan-300/50 bg-[#12304a] text-cyan-100"}`}>{gate.type === "CNOT" && gate.control === qubit ? "•" : gate.type === "CNOT" ? "⊕" : gate.type}</button> : null))}</div></div>)}</div><div className="mt-16 flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-4"><span className="text-xs text-slate-500">Click a gate to remove it</span><div className="flex gap-2"><button onClick={() => setStep(0)} disabled={!result.executionSteps.length} className="rounded-md border border-white/15 px-2 py-1 text-xs disabled:opacity-40">Step</button><button onClick={() => setStep(null)} className="rounded-md bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950">Run circuit</button></div></div></div><aside className="panel rounded-2xl p-5"><p className="text-xs font-bold uppercase tracking-wider text-cyan-300">{step === null ? "Measurement result" : `Step ${step + 1} of ${result.executionSteps.length}`}</p><p className="mt-2 text-xs text-slate-500">{step === null ? "Final state" : result.executionSteps[step]?.gate.type}</p><div className="mt-8"><ProbabilityDistribution state={display} /></div><pre className="mt-7 overflow-x-auto rounded-lg bg-black/20 p-3 text-[10px] text-slate-400">{circuit.moments.map((m, i) => `${i}: ${m.map(g => g.type).join(" · ")}`).join("\n") || "Empty circuit"}</pre></aside></div>;
}
