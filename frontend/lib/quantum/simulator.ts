import type { CircuitGate, Complex, ExecutionStep, QuantumCircuit, QuantumState, SimulationResult } from "@/types/quantum";

const c = (re = 0, im = 0): Complex => ({ re, im });
const add = (a: Complex, b: Complex) => c(a.re + b.re, a.im + b.im);
const mul = (a: Complex, b: Complex) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const magnitude2 = (a: Complex) => a.re * a.re + a.im * a.im;
const phase = (theta: number) => c(Math.cos(theta), Math.sin(theta));

export const basisLabel = (index: number, qubits: number) => `|${index.toString(2).padStart(qubits, "0")}⟩`;
export function stateFromAmplitudes(amplitudes: Complex[], numQubits: number): QuantumState {
  return { amplitudes, probabilities: amplitudes.map(magnitude2), numQubits, basisStates: amplitudes.map((_, i) => basisLabel(i, numQubits)) };
}
export function initialState(numQubits: number): QuantumState { return stateFromAmplitudes(Array.from({ length: 2 ** numQubits }, (_, i) => i === 0 ? c(1) : c()), numQubits); }
export function qubitStateFromPolarAngle(angleDegrees: number): QuantumState { const theta = angleDegrees * Math.PI / 180; return stateFromAmplitudes([c(Math.cos(theta / 2)), c(Math.sin(theta / 2))], 1); }

function matrixFor(gate: CircuitGate): [[Complex, Complex], [Complex, Complex]] {
  const inv = 1 / Math.sqrt(2), angle = gate.parameter ?? Math.PI / 2;
  switch (gate.type) {
    case "H": return [[c(inv), c(inv)], [c(inv), c(-inv)]];
    case "X": return [[c(), c(1)], [c(1), c()]];
    case "Y": return [[c(), c(0, -1)], [c(0, 1), c()]];
    case "Z": return [[c(1), c()], [c(), c(-1)]];
    case "S": return [[c(1), c()], [c(), c(0, 1)]];
    case "T": return [[c(1), c()], [c(), phase(Math.PI / 4)]];
    case "RX": return [[c(Math.cos(angle / 2)), c(0, -Math.sin(angle / 2))], [c(0, -Math.sin(angle / 2)), c(Math.cos(angle / 2))]];
    case "RY": return [[c(Math.cos(angle / 2)), c(-Math.sin(angle / 2))], [c(Math.sin(angle / 2)), c(Math.cos(angle / 2))]];
    case "RZ": return [[phase(-angle / 2), c()], [c(), phase(angle / 2)]];
    default: return [[c(1), c()], [c(), c(1)]];
  }
}
function applySingle(state: QuantumState, gate: CircuitGate): QuantumState {
  const matrix = matrixFor(gate), output = state.amplitudes.map(value => ({ ...value })), mask = 1 << (state.numQubits - gate.target - 1);
  for (let i = 0; i < output.length; i++) if ((i & mask) === 0) { const j = i | mask, a = state.amplitudes[i], b = state.amplitudes[j]; output[i] = add(mul(matrix[0][0], a), mul(matrix[0][1], b)); output[j] = add(mul(matrix[1][0], a), mul(matrix[1][1], b)); }
  return stateFromAmplitudes(output, state.numQubits);
}
function applyCnot(state: QuantumState, gate: CircuitGate): QuantumState {
  if (gate.control === undefined) return state;
  const output = state.amplitudes.map(value => ({ ...value })), controlMask = 1 << (state.numQubits - gate.control - 1), targetMask = 1 << (state.numQubits - gate.target - 1);
  for (let i = 0; i < output.length; i++) if ((i & controlMask) !== 0 && (i & targetMask) === 0) { const j = i | targetMask; [output[i], output[j]] = [output[j], output[i]]; }
  return stateFromAmplitudes(output, state.numQubits);
}
export function applyGate(state: QuantumState, gate: CircuitGate): QuantumState { return gate.type === "CNOT" ? applyCnot(state, gate) : gate.type === "MEASURE" ? state : applySingle(state, gate); }
export function simulateCircuit(circuit: QuantumCircuit, shots = 100): SimulationResult {
  let current = initialState(circuit.qubits); const executionSteps: ExecutionStep[] = [];
  circuit.moments.forEach((moment, momentIndex) => moment.forEach(gate => { current = applyGate(current, gate); executionSteps.push({ moment: momentIndex, gate, state: current }); }));
  const measurementCounts = current.probabilities.reduce<Record<string, number>>((counts, probability, index) => { counts[basisLabel(index, circuit.qubits)] = Math.round(probability * shots); return counts; }, {});
  return { finalState: current, probabilities: current.probabilities, measurementCounts, executionSteps };
}
