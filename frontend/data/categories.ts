export type Category =
  | "math"
  | "fundamentals"
  | "core"
  | "algorithms"
  | "nisq"
  | "advanced";

export const categories: Record<
  Category,
  {
    label: string;
    eyebrow: string;
    color: string;
    time: string;
    lessons: string[];
  }
> = {
  math: {
    label: "Math foundations",
    eyebrow: "The tools",
    color: "#06b6d4",
    time: "8 lessons · 4h 20m",
    lessons: [
      "Complex Numbers",
      "Vectors",
      "Matrices",
      "Matrix Multiplication",
      "Inner Products",
      "Eigenvalues & Eigenvectors",
      "Probability",
      "Tensor Products",
    ],
  },
  fundamentals: {
    label: "Quantum foundations",
    eyebrow: "The strange rules",
    color: "#6366f1",
    time: "8 lessons · 5h 10m",
    lessons: [
      "Classical Bits vs Qubits",
      "Quantum States",
      "Superposition",
      "Measurement",
      "Dirac Notation",
      "Bloch Sphere",
      "Single-Qubit Gates",
      "Basic Quantum Circuits",
    ],
  },
  core: {
    label: "Core quantum computing",
    eyebrow: "When qubits connect",
    color: "#3b82f6",
    time: "11 lessons · 8h 40m",
    lessons: [
      "Multiple Qubits",
      "Tensor Products",
      "Multi-Qubit States",
      "Controlled Gates",
      "CNOT",
      "Entanglement",
      "Bell States",
      "Phase Kickback",
      "No-Cloning Theorem",
      "Quantum Teleportation",
      "Superdense Coding",
    ],
  },
  algorithms: {
    label: "Quantum algorithms",
    eyebrow: "Quantum advantage",
    color: "#8b5cf6",
    time: "7 lessons · 7h 30m",
    lessons: [
      "Deutsch",
      "Deutsch-Jozsa",
      "Bernstein-Vazirani",
      "Grover",
      "Quantum Fourier Transform",
      "Quantum Phase Estimation",
      "Shor",
    ],
  },
  nisq: {
    label: "Hardware & NISQ",
    eyebrow: "The real world",
    color: "#ec4899",
    time: "8 lessons · 6h 15m",
    lessons: [
      "Real Quantum Hardware",
      "Noise",
      "Decoherence",
      "T1 Relaxation",
      "T2 Dephasing",
      "Noise Channels",
      "Error Mitigation",
      "Quantum Error Correction",
    ],
  },
  advanced: {
    label: "Advanced quantum",
    eyebrow: "At the frontier",
    color: "#2563eb",
    time: "7 lessons · 8h 10m",
    lessons: [
      "VQE",
      "QAOA",
      "Quantum Simulation",
      "Hamiltonians",
      "Stabilizer Formalism",
      "Surface Codes",
      "Fault-Tolerant Quantum Computing",
    ],
  },
};

export const categoryKeys = Object.keys(categories) as Category[];

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
