"use client";

import { useMemo, useState } from "react";
import CodeEditor from "./ide-editor";

type Language = "c" | "cpp" | "python" | "java" | "javascript";

type LanguageOption = {
  value: Language;
  label: string;
  fileName: string;
};

const languages: LanguageOption[] = [
  {
    value: "javascript",
    label: "JavaScript",
    fileName: "main.js",
  },
  {
    value: "python",
    label: "Python",
    fileName: "main.py",
  },
  {
    value: "c",
    label: "C",
    fileName: "main.c",
  },
  {
    value: "cpp",
    label: "C++",
    fileName: "main.cpp",
  },
  {
    value: "java",
    label: "Java",
    fileName: "Main.java",
  },
];

const starterCode: Record<Language, string> = {
  javascript: `console.log("Hello from JavaScript");`,

  python: `print("Hello from Python")`,

  c: `#include <stdio.h>

int main() {
    printf("Hello from C\\n");
    return 0;
}`,

  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++" << endl;
    return 0;
}`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java");
    }
}`,
};

export default function CodeIDE() {
  const [language, setLanguage] =
    useState<Language>("javascript");

  const [code, setCode] = useState<string>(
    starterCode.javascript
  );

  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const selectedLanguage = useMemo(() => {
    return (
      languages.find((item) => item.value === language) ??
      languages[0]
    );
  }, [language]);

  function handleLanguageChange(
    nextLanguage: Language
  ) {
    setLanguage(nextLanguage);
    setCode(starterCode[nextLanguage]);
    setOutput("");
    setError("");
  }

  async function handleRunCode() {
    if (!code.trim()) {
      setError("Please write some code before running it.");
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
            language,
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
      console.error("IDE request error:", requestError);

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
    setCode(starterCode[language]);
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
              Write and run programs in multiple languages.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="language-select"
            className="text-sm font-semibold text-slate-700"
          >
            Language
          </label>

          <select
            id="language-select"
            value={language}
            onChange={(event) =>
              handleLanguageChange(
                event.target.value as Language
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            {languages.map((item) => (
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
            {selectedLanguage.fileName}
          </span>
        </div>

        <span className="text-xs text-slate-500">
          {selectedLanguage.label}
        </span>
      </div>

      {/* Advanced editor */}
      <CodeEditor
        code={code}
        language={language}
        onChange={setCode}
      />

      {/* Output header */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Program Output
          </h3>

          <p className="text-sm text-slate-500">
            Output and errors from your program appear here.
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
            Run your program to see the output...
          </p>
        )}

        {isRunning && (
          <p className="text-yellow-300">
            Running your {selectedLanguage.label} program...
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
          Supported: C, C++, Python, Java, JavaScript
        </span>
      </div>
    </section>
  );
}