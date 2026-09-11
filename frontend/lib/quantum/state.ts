import type { QuantumState } from "@/types/quantum";

/** Build a single-qubit state from a polar angle in degrees. */
export function qubitStateFromPolarAngle(degrees: number): QuantumState {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians / 2);
  const sin = Math.sin(radians / 2);
  const p0 = cos * cos;
  const p1 = sin * sin;

  return {
    amplitudes: [
      { re: cos, im: 0 },
      { re: sin, im: 0 },
    ],
    probabilities: [p0, p1],
    numQubits: 1,
    basisStates: ["|0⟩", "|1⟩"],
  };
}
