"use client";

import { useState, useEffect } from "react";

// Global cache for client-side synchronous access
let globalCircuitJson: string | null = null;
const listeners = new Set<(json: string | null) => void>();

export interface CircuitSummaryInfo {
  numWires: number;
  totalGates: number;
  gateTypes: string[];
  summaryText: string;
}

/**
 * Parses Quirk circuit JSON and computes a friendly summary of wires and gates.
 */
export function summarizeQuirkCircuit(circuitInput: unknown): CircuitSummaryInfo | null {
  if (!circuitInput) return null;

  let circuit: any = circuitInput;
  if (typeof circuit === "string") {
    try {
      circuit = JSON.parse(circuit);
    } catch {
      return null;
    }
  }

  if (!circuit || !Array.isArray(circuit.cols)) {
    return null;
  }

  const cols = circuit.cols;
  let maxWires = 0;
  let totalGates = 0;
  const gateTypeSet = new Set<string>();

  for (const col of cols) {
    if (!Array.isArray(col)) continue;
    maxWires = Math.max(maxWires, col.length);

    let hasControl = false;
    let targetGate: string | null = null;

    for (const gate of col) {
      if (gate === 1 || gate === null || gate === undefined || gate === 0) {
        continue;
      }
      totalGates++;
      if (gate === "•" || gate === "Control") {
        hasControl = true;
      } else if (gate === "◦" || gate === "AntiControl") {
        hasControl = true;
      } else if (typeof gate === "string") {
        targetGate = gate;
        gateTypeSet.add(gate);
      } else if (gate && typeof gate === "object" && gate.id) {
        gateTypeSet.add(gate.id);
      }
    }

    if (hasControl && targetGate) {
      if (targetGate === "X") gateTypeSet.add("CNOT");
      else if (targetGate === "Z") gateTypeSet.add("CZ");
    }
  }

  if (Array.isArray(circuit.init)) {
    maxWires = Math.max(maxWires, circuit.init.length);
  }

  maxWires = Math.max(maxWires, totalGates > 0 ? 1 : 0);

  if (totalGates === 0) {
    return {
      numWires: maxWires,
      totalGates: 0,
      gateTypes: [],
      summaryText: "Empty circuit",
    };
  }

  const gateList = Array.from(gateTypeSet).slice(0, 4).join(", ");
  const summaryText = `${maxWires} qubit${maxWires > 1 ? "s" : ""}, ${totalGates} gate${totalGates > 1 ? "s" : ""}${
    gateList ? ` (${gateList})` : ""
  }`;

  return {
    numWires: maxWires,
    totalGates,
    gateTypes: Array.from(gateTypeSet),
    summaryText,
  };
}

/**
 * Updates the live circuit tracking across the app.
 */
export function setLiveCircuit(jsonText: string | null) {
  globalCircuitJson = jsonText;
  if (typeof window !== "undefined") {
    (window as any).__QUIRK_CIRCUIT_JSON__ = jsonText;
    try {
      (window as any).__QUIRK_CIRCUIT__ = jsonText ? JSON.parse(jsonText) : null;
    } catch {
      (window as any).__QUIRK_CIRCUIT__ = null;
    }
  }

  for (const listener of listeners) {
    try {
      listener(jsonText);
    } catch (e) {
      console.error("Error in circuit listener:", e);
    }
  }
}

/**
 * Gets the current raw circuit JSON string synchronously.
 */
export function getLiveCircuitJson(): string | null {
  if (globalCircuitJson) return globalCircuitJson;
  if (typeof window !== "undefined" && (window as any).__QUIRK_CIRCUIT_JSON__) {
    return (window as any).__QUIRK_CIRCUIT_JSON__;
  }
  return null;
}

/**
 * Gets the current parsed circuit object synchronously.
 */
export function getLiveCircuit(): any | null {
  const json = getLiveCircuitJson();
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Gets the human-readable summary string of the current circuit.
 */
export function getLiveCircuitSummary(): string | null {
  const circuit = getLiveCircuit();
  const summary = summarizeQuirkCircuit(circuit);
  return summary ? summary.summaryText : null;
}

/**
 * React hook for components to subscribe to live circuit modifications.
 */
export function useLiveCircuit() {
  const [circuitJson, setCircuitJsonState] = useState<string | null>(() => getLiveCircuitJson());

  useEffect(() => {
    // Initial check from window
    const initial = getLiveCircuitJson();
    if (initial !== circuitJson) {
      setCircuitJsonState(initial);
    }

    const onTrackerUpdate = (updatedJson: string | null) => {
      setCircuitJsonState(updatedJson);
    };

    listeners.add(onTrackerUpdate);

    // Also listen to window CustomEvent for events dispatched from Vanilla Quirk (exports.js)
    const onWindowEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ jsonText?: string }>;
      const newJson = customEvent.detail?.jsonText ?? getLiveCircuitJson();
      globalCircuitJson = newJson;
      setCircuitJsonState(newJson);
    };

    window.addEventListener("quirk-circuit-change", onWindowEvent);

    return () => {
      listeners.delete(onTrackerUpdate);
      window.removeEventListener("quirk-circuit-change", onWindowEvent);
    };
  }, []);

  const parsedCircuit = circuitJson ? (() => {
    try {
      return JSON.parse(circuitJson);
    } catch {
      return null;
    }
  })() : null;

  const summaryInfo = summarizeQuirkCircuit(parsedCircuit);
  const hasCircuit = Boolean(summaryInfo && summaryInfo.totalGates > 0);

  return {
    circuitJson,
    circuit: parsedCircuit,
    summary: summaryInfo?.summaryText ?? null,
    summaryInfo,
    hasCircuit,
  };
}
