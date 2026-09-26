"use client";

import { useState } from "react";
import CodeEditor from "./ide-editor";

type Framework = "qiskit" | "pennylane" | "cirq";
type FileType = "python" | "notebook";

type NotebookCell = {
  id: number;
  code: string;
  output: string;
  error: string;
  isRunning: boolean;
};

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


const API_URL =
  process.env.NEXT_PUBLIC_AI_BACKEND_URL ??
  "http://localhost:4000";

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

function createNotebookCell(
  id: number,
  framework: Framework
): NotebookCell {
  return {
    id,
    code: starterCode[framework],
    output: "",
    error: "",
    isRunning: false,
  };
}

export default function CodeIDE() {
  const [framework, setFramework] =
    useState<Framework>("qiskit");

  const [fileType, setFileType] =
    useState<FileType>("python");

  // -----------------------------
  // Python file state
  // -----------------------------

  const [code, setCode] = useState<string>(
    starterCode.qiskit
  );

  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // -----------------------------
  // Notebook state
  // -----------------------------

  const [cells, setCells] = useState<NotebookCell[]>([
    createNotebookCell(1, "qiskit"),
  ]);

  const selectedFramework =
    frameworks.find(
      (item) => item.value === framework
    ) ?? frameworks[0];

  // ==========================================
  // Framework change
  // ==========================================

  function handleFrameworkChange(
    nextFramework: Framework
  ) {
    setFramework(nextFramework);

    // Python editor
    setCode(starterCode[nextFramework]);

    // Notebook
    setCells([
      createNotebookCell(1, nextFramework),
    ]);

    setOutput("");
    setError("");
  }

  // ==========================================
  // File type change
  // ==========================================

  function handleFileTypeChange(
    nextType: FileType
  ) {
    setFileType(nextType);

    setOutput("");
    setError("");
  }

  // ==========================================
  // Run normal Python file
  // ==========================================

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
        `${API_URL}/api/run`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            language: "python",
            framework,
            fileType: "python",
            code,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Code execution failed."
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

  // ==========================================
  // Run notebook
  // ==========================================

  async function runNotebook(
    notebookCells: NotebookCell[]
  ) {
    const notebook = {
      cells: notebookCells.map((cell) => ({
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: cell.code,
      })),

      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3",
        },

        language_info: {
          name: "python",
        },
      },

      nbformat: 4,
      nbformat_minor: 5,
    };

    const response = await fetch(
      `${API_URL}/api/run`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          language: "python",
          framework,
          fileType: "notebook",
          notebook,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Notebook execution failed."
      );
    }

    return result;
  }

  // ==========================================
  // Run ALL notebook cells
  // ==========================================

  async function handleRunAllCells() {
    const validCells = cells.filter(
      (cell) => cell.code.trim()
    );

    if (validCells.length === 0) {
      setError(
        "Please add some Python code to your notebook."
      );

      return;
    }

    setError("");

    setCells((previous) =>
      previous.map((cell) => ({
        ...cell,
        isRunning: true,
        output: "",
        error: "",
      }))
    );

    try {
      const result =
        await runNotebook(validCells);

      const executedCells =
        result.cells || [];

      setCells((previous) =>
        previous.map((cell, index) => {
          const executed =
            executedCells[index];

          return {
            ...cell,
            isRunning: false,
            output:
              executed?.output || "",
            error:
              executed?.error || "",
          };
        })
      );
    } catch (runError) {
      setCells((previous) =>
        previous.map((cell) => ({
          ...cell,
          isRunning: false,
        }))
      );

      setError(
        runError instanceof Error
          ? runError.message
          : "Notebook execution failed."
      );
    }
  }

  // ==========================================
  // Run individual cell
  // ==========================================

  async function handleRunCell(
    cellId: number
  ) {
    const cell = cells.find(
      (item) => item.id === cellId
    );

    if (!cell || !cell.code.trim()) {
      return;
    }

    setCells((previous) =>
      previous.map((item) =>
        item.id === cellId
          ? {
              ...item,
              isRunning: true,
              output: "",
              error: "",
            }
          : item
      )
    );

    try {
      const result = await runNotebook([
        cell,
      ]);

      const executed =
        result.cells?.[0];

      setCells((previous) =>
        previous.map((item) =>
          item.id === cellId
            ? {
                ...item,
                isRunning: false,
                output:
                  executed?.output || "",
                error:
                  executed?.error || "",
              }
            : item
        )
      );
    } catch (runError) {
      setCells((previous) =>
        previous.map((item) =>
          item.id === cellId
            ? {
                ...item,
                isRunning: false,
                error:
                  runError instanceof Error
                    ? runError.message
                    : "Cell execution failed.",
              }
            : item
        )
      );
    }
  }

  // ==========================================
  // Update notebook cell
  // ==========================================

  function updateCell(
    cellId: number,
    newCode: string
  ) {
    setCells((previous) =>
      previous.map((cell) =>
        cell.id === cellId
          ? {
              ...cell,
              code: newCode,
            }
          : cell
      )
    );
  }

  // ==========================================
  // Add notebook cell
  // ==========================================

  function addCell() {
    const nextId =
      cells.length > 0
        ? Math.max(
            ...cells.map(
              (cell) => cell.id
            )
          ) + 1
        : 1;

    setCells((previous) => [
      ...previous,

      {
        id: nextId,
        code: "",
        output: "",
        error: "",
        isRunning: false,
      },
    ]);
  }

  // ==========================================
  // Delete notebook cell
  // ==========================================

  function deleteCell(cellId: number) {
    if (cells.length === 1) {
      return;
    }

    setCells((previous) =>
      previous.filter(
        (cell) => cell.id !== cellId
      )
    );
  }

  // ==========================================
  // Reset
  // ==========================================

  function handleReset() {
    if (fileType === "python") {
      setCode(starterCode[framework]);

      setOutput("");
      setError("");

      return;
    }

    setCells([
      createNotebookCell(1, framework),
    ]);

    setError("");
  }

  // ==========================================
  // Clear output
  // ==========================================

  function handleClearOutput() {
    setOutput("");
    setError("");

    setCells((previous) =>
      previous.map((cell) => ({
        ...cell,
        output: "",
        error: "",
      }))
    );
  }

  return (
    <section className="w-full rounded-[26px] border border-slate-200 bg-white/90 p-3 shadow-[0_16px_52px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 backdrop-blur-sm sm:p-4 lg:p-5">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-sky-100 text-xl shadow-sm ring-1 ring-cyan-100">
            ⚛
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Quantum Code Lab
            </h2>

            <p className="text-xs text-slate-500">
              Write and run quantum programs with Python.
            </p>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
            {selectedFramework.label}
          </div>
          <div className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {fileType === "python" ? "Python" : "Notebook"}
          </div>
        </div>

        {/* ================================= */}
        {/* CONTROLS */}
        {/* ================================= */}

        <div className="flex flex-wrap items-center gap-2">

          <label
            htmlFor="file-type-select"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
          >
            File
          </label>

          <select
            id="file-type-select"
            value={fileType}
            onChange={(event) =>
              handleFileTypeChange(
                event.target.value as FileType
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 outline-none transition hover:border-cyan-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="python">
              Python (.py)
            </option>

            <option value="notebook">
              Jupyter (.ipynb)
            </option>
          </select>

          <label
            htmlFor="framework-select"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
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
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 outline-none transition hover:border-cyan-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
            onClick={handleReset}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
          >
            Reset
          </button>

          {fileType === "python" ? (
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_12px_24px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRunning
                ? "Running..."
                : "▶ Run"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRunAllCells}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_12px_24px_rgba(16,185,129,0.35)]"
            >
              ▶ Run All
            </button>
          )}

        </div>
      </div>

      {/* ===================================== */}
      {/* FILE INFORMATION */}
      {/* ===================================== */}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">

        <div className="flex items-center gap-2 text-sm text-slate-700">

          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-base shadow-sm ring-1 ring-slate-200">
            {fileType === "python"
              ? "📄"
              : "📓"}
          </span>

          <span className="font-mono text-sm text-slate-700">
            {fileType === "python"
              ? "main.py"
              : "main.ipynb"}
          </span>

        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">
            {selectedFramework.label}
          </span>
          <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">
            Ready
          </span>
        </div>

      </div>

      {/* ===================================== */}
      {/* PYTHON EDITOR */}
      {/* ===================================== */}

      {fileType === "python" && (
        <>
          <CodeEditor
            code={code}
            language="python"
            onChange={setCode}
          />

          {/* Output */}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Program Output
              </h3>

              <p className="text-xs text-slate-500">
                Output and errors from your quantum program appear here.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearOutput}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Clear output
            </button>

          </div>

          <div className="mt-2 min-h-[150px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm shadow-inner shadow-slate-200/70">

            {!output &&
              !error &&
              !isRunning && (
                <p className="text-slate-500">
                  Run your{" "}
                  {selectedFramework.label}{" "}
                  program to see the output...
                </p>
              )}

            {isRunning && (
              <p className="text-amber-700">
                Running your{" "}
                {selectedFramework.label}{" "}
                program...
              </p>
            )}

            {output && (
              <pre className="whitespace-pre-wrap break-words text-emerald-700">
                {output}
              </pre>
            )}

            {error && (
              <pre className="mt-2 whitespace-pre-wrap break-words text-red-600">
                {error}
              </pre>
            )}

          </div>
        </>
      )}

      {/* ===================================== */}
      {/* JUPYTER NOTEBOOK */}
      {/* ===================================== */}

      {fileType === "notebook" && (
        <div className="space-y-4">

          {cells.map((cell, index) => (
            <div
              key={cell.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >

              {/* Cell header */}

              <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-2">

                <div className="flex items-center gap-3">

                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    In [{index + 1}]
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      handleRunCell(cell.id)
                    }
                    disabled={
                      cell.isRunning ||
                      !cell.code.trim()
                    }
                    className="rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:translate-y-[-1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cell.isRunning
                      ? "Running..."
                      : "▶ Run Cell"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteCell(cell.id)
                    }
                    disabled={cells.length === 1}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>

                </div>
              </div>

              {/* Monaco cell */}

              <div className="p-2.5">

                <CodeEditor
                  code={cell.code}
                  language="python"
                  onChange={(value) =>
                    updateCell(
                      cell.id,
                      value
                    )
                  }
                />

              </div>

              {/* Cell output */}

              {(cell.output ||
                cell.error ||
                cell.isRunning) && (
                <div className="border-t border-slate-200 bg-slate-50 p-4">

                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Out [{index + 1}]
                  </div>

                  {cell.isRunning && (
                    <p className="text-amber-700">
                      Running cell...
                    </p>
                  )}

                  {cell.output && (
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm text-emerald-700">
                      {cell.output}
                    </pre>
                  )}

                  {cell.error && (
                    <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm text-red-600">
                      {cell.error}
                    </pre>
                  )}

                </div>
              )}

            </div>
          ))}

          {/* Add cell */}

          <button
            type="button"
            onClick={addCell}
            className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 active:scale-[0.995]"
          >
            + Add Code Cell
          </button>

        </div>
      )}

      {/* ===================================== */}
      {/* ERROR */}
      {/* ===================================== */}

      {error && fileType === "notebook" && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-700">
            Notebook Error
          </p>

          <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm text-red-600">
            {error}
          </pre>

        </div>
      )}

      {/* ===================================== */}
      {/* FOOTER */}
      {/* ===================================== */}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500">

        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
          Backend:{" "}
          <span className="font-mono text-slate-600">
            {API_URL}/api/run
          </span>
        </span>

        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
          Python • Qiskit • PennyLane • Cirq • Jupyter
        </span>

      </div>

    </section>
  );
}