export type Complex = { re: number; im: number };
export type GateType = "H" | "X" | "Y" | "Z" | "S" | "T" | "RX" | "RY" | "RZ" | "CNOT" | "MEASURE";

export type CircuitGate = {
  id: string;
  type: GateType;
  target: number;
  control?: number;
  parameter?: number;
};

export type QuantumCircuit = {
  qubits: number;
  moments: CircuitGate[][];
};

export type QuantumState = {
  amplitudes: Complex[];
  probabilities: number[];
  numQubits: number;
  basisStates: string[];
};

export type ExecutionStep = {
  moment: number;
  gate: CircuitGate;
  state: QuantumState;
};

export type SimulationResult = {
  finalState: QuantumState;
  probabilities: number[];
  measurementCounts: Record<string, number>;
  executionSteps: ExecutionStep[];
};
