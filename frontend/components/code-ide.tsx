"use client";

import { useState } from "react";
import CodeEditor from "./ide-editor";

type Framework = "qiskit" | "pennylane" | "cirq";

type FrameworkOption = {
  value: Framework;
  label: string;
};

const frameworks: FrameworkOption[] = [
  {
    value: "qiskit",
    label: "Qiskit",
  },
  {
    value: "pennylane",
    label: "PennyLane",
  },
  {
    value: "cirq",
    label: "Cirq",
  },
];

const starterCode: Record<Framework, string> = {
  qiskit: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

qc.h(0)
qc.cx(0, 1)

print(qc)
`,

  pennylane: `import pennylane as qml

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.probs(wires=[0, 1])

print(circuit())
`,

  cirq: `import cirq

q0 = cirq.LineQubit(0)
q1 = cirq.LineQubit(1)

circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.CNOT(q0, q1)
)

print(circuit)
`,
};

export default function CodeIDE() {
  const [framework, setFramework] =
    useState<Framework>("qiskit");

  const [code, setCode] = useState<string>(
    starterCode.qiskit
  );

  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const selectedFramework =
    frameworks.find(
      (item) => item.value === framework
    ) ?? frameworks[0];

  function handleFrameworkChange(
    nextFramework: Framework
  ) {
    setFramework(nextFramework);

    // Load starter code for the selected framework
    setCode(starterCode[nextFramework]);

    // Clear previous output/errors
    setOutput("");
    setError("");
  }

  async function handleRunCode() {
    if (!code.trim()) {
      setError(
        "Please write some Python code before running it."
      );
      setOutput("");
      return;
    }

    setIsRunning(true);
    setOutput("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:4000/api/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: "python",
            framework,
            code,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Code execution failed."
        );

        setOutput(result.output || "");
        return;
      }

      setOutput(result.output || "");
      setError(result.error || "");
    } catch (requestError) {
      console.error(
        "IDE request error:",
        requestError
      );

      setError(
        "Could not connect to the backend. Make sure server.js is running on port 4000."
      );
    } finally {
      setIsRunning(false);
    }
  }

  function handleClearOutput() {
    setOutput("");
    setError("");
  }

  function handleResetCode() {
    setCode(starterCode[framework]);
    setOutput("");
    setError("");
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
            ⚛
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Quantum Code Lab
            </h2>

            <p className="text-sm text-slate-500">
              Write and run quantum programs with Python.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="framework-select"
            className="text-sm font-semibold text-slate-700"
          >
            Framework
          </label>

          <select
            id="framework-select"
            value={framework}
            onChange={(event) =>
              handleFrameworkChange(
                event.target.value as Framework
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            {frameworks.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleResetCode}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "Running..." : "▶ Run"}
          </button>
        </div>
      </div>

      {/* File information */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span>📄</span>

          <span className="font-mono">
            main.py
          </span>
        </div>

        <span className="text-xs text-slate-500">
          {selectedFramework.label} • Python
        </span>
      </div>

      {/* Advanced editor */}
      <CodeEditor
        code={code}
        language="python"
        onChange={setCode}
      />

      {/* Output header */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Program Output
          </h3>

          <p className="text-sm text-slate-500">
            Output and errors from your quantum program appear here.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearOutput}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Clear output
        </button>
      </div>

      {/* Output panel */}
      <div className="mt-3 min-h-[160px] overflow-auto rounded-xl border border-slate-700 bg-[#0f172a] p-4 font-mono text-sm">
        {!output && !error && !isRunning && (
          <p className="text-slate-500">
            Run your {selectedFramework.label} program to see the output...
          </p>
        )}

        {isRunning && (
          <p className="text-yellow-300">
            Running your {selectedFramework.label} program...
          </p>
        )}

        {output && (
          <pre className="whitespace-pre-wrap break-words text-emerald-300">
            {output}
          </pre>
        )}

        {error && (
          <pre className="mt-2 whitespace-pre-wrap break-words text-red-300">
            {error}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          Backend:{" "}
          <span className="font-mono">
            localhost:4000/api/run
          </span>
        </span>

        <span>
          Python • Qiskit • PennyLane • Cirq
        </span>
      </div>
    </section>
  );
}