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
        "http://localhost:4000/api/run",
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
      "http://localhost:4000/api/run",
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
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

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

        {/* ================================= */}
        {/* CONTROLS */}
        {/* ================================= */}

        <div className="flex flex-wrap items-center gap-2">

          <label
            htmlFor="file-type-select"
            className="text-sm font-semibold text-slate-700"
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
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
            onClick={handleReset}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Reset
          </button>

          {fileType === "python" ? (
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning}
              className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRunning
                ? "Running..."
                : "▶ Run"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRunAllCells}
              className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-600"
            >
              ▶ Run All
            </button>
          )}

        </div>
      </div>

      {/* ===================================== */}
      {/* FILE INFORMATION */}
      {/* ===================================== */}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">

        <div className="flex items-center gap-2 text-sm text-slate-700">

          <span>
            {fileType === "python"
              ? "📄"
              : "📓"}
          </span>

          <span className="font-mono">
            {fileType === "python"
              ? "main.py"
              : "main.ipynb"}
          </span>

        </div>

        <span className="text-xs text-slate-500">
          {selectedFramework.label} • Python
        </span>

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

          <div className="mt-3 min-h-[160px] overflow-auto rounded-xl border border-slate-700 bg-[#0f172a] p-4 font-mono text-sm">

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
              <p className="text-yellow-300">
                Running your{" "}
                {selectedFramework.label}{" "}
                program...
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

              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">

                <div className="flex items-center gap-3">

                  <span className="font-mono text-xs font-bold text-slate-500">
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
                    className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>

                </div>
              </div>

              {/* Monaco cell */}

              <div className="p-3">

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
                <div className="border-t border-slate-200 bg-slate-950 p-4">

                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Out [{index + 1}]
                  </div>

                  {cell.isRunning && (
                    <p className="text-yellow-300">
                      Running cell...
                    </p>
                  )}

                  {cell.output && (
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm text-emerald-300">
                      {cell.output}
                    </pre>
                  )}

                  {cell.error && (
                    <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm text-red-300">
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
            className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700"
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">

        <span>
          Backend:{" "}
          <span className="font-mono">
            localhost:4000/api/run
          </span>
        </span>

        <span>
          Python • Qiskit • PennyLane • Cirq • Jupyter
        </span>

      </div>

    </section>
  );
}