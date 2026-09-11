"use client";

import Link from "next/link";
import { useState } from "react";
import { CircuitEditor } from "@/components/quantum/circuit-editor";
import { StateVector } from "@/components/quantum/visualization/state-vector";
import { ProbabilityDistribution } from "@/components/quantum/visualization/probability-distribution";
import { qubitStateFromPolarAngle } from "@/lib/quantum/state";
import { getLesson } from "@/data/lessons";
import { MathFoundations } from "@/components/math/math-foundations";
import { MathLesson } from "@/components/math/math-lesson";
import { PlatformHeader } from "@/components/platform/header";
import { Homepage } from "@/components/home/homepage";
import {
  categories,
  categoryKeys,
  slugify,
  type Category,
} from "@/data/categories";

type View =
  | "home"
  | "roadmap"
  | "category"
  | "lesson"
  | "playground"
  | "simulator";

export function QuantumLab({
  view,
  category = "fundamentals",
  lesson = "superposition",
}: {
  view: View;
  category?: Category;
  lesson?: string;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <main
      className={`min-h-screen ${
        theme === "dark" ? "theme-dark" : "theme-light"
      }`}
    >
      <PlatformHeader theme={theme} onThemeChange={setTheme} />

      {view === "home" && <Homepage />}
      {view === "roadmap" && <Roadmap />}
      {view === "category" &&
        (category === "math" ? (
          <MathFoundations />
        ) : (
          <CategoryPage category={category} />
        ))}
      {view === "lesson" &&
        (category === "math" ? (
          <MathLesson lessonSlug={lesson} />
        ) : (
          <LessonPage category={category} lesson={lesson} />
        ))}
      {(view === "playground" || view === "simulator") && (
        <Workbench simulator={view === "simulator"} />
      )}
    </main>
  );
}

function Roadmap() {
  return (
    <section className="aurora lab-grid min-h-[calc(100vh-64px)] px-5 py-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">
          Learning map
        </p>

        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Build your quantum intuition, one experiment at a time.
        </h1>

        <p className="mt-4 max-w-xl leading-7 text-slate-600">
          Follow the signal from mathematical tools to fault-tolerant systems.
          Every track opens with something you can explore.
        </p>

        <div className="mt-12 space-y-3">
          {categoryKeys.map((key, i) => {
            const c = categories[key];

            return (
              <Link
                href={`/learn/${key}`}
                key={key}
                className="panel panel-hover group flex items-center gap-4 rounded-2xl p-5 sm:gap-7"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-mono text-sm font-bold"
                  style={{
                    color: c.color,
                    background: `${c.color}15`,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: c.color }}
                  >
                    {c.eyebrow}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {c.label}
                  </h2>
                </div>

                <div className="hidden text-xs text-slate-500 sm:block">
                  {c.time}
                </div>

                <span className="text-slate-400 transition group-hover:text-cyan-600">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryPage({ category }: { category: Category }) {
  const c = categories[category];

  return (
    <section className="aurora lab-grid min-h-[calc(100vh-64px)] px-5 py-14">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/learn"
          className="text-sm text-slate-500 transition hover:text-cyan-600"
        >
          ← Learning map
        </Link>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[.2em]"
              style={{ color: c.color }}
            >
              {c.eyebrow}
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {c.label}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Start with a phenomenon, make a prediction, then uncover the rules
              that shape it.
            </p>
          </div>

          <div className="panel self-end rounded-xl px-5 py-4 text-sm text-slate-600">
            <b className="text-slate-900">{c.lessons.length} lessons</b>
            <br />
            {c.time}
          </div>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {c.lessons.map((name, i) => (
            <Link
              key={name}
              href={`/learn/${category}/${slugify(name)}`}
              className="panel panel-hover group flex min-h-28 items-center gap-4 rounded-2xl p-5"
            >
              <span
                className="font-mono text-xs font-bold"
                style={{ color: c.color }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex-1">
                <h2 className="font-semibold text-slate-900">{name}</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Explore · experiment · explain
                </p>
              </div>

              <span className="text-slate-400 transition group-hover:text-cyan-600">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LessonPage({
  category,
  lesson,
}: {
  category: Category;
  lesson: string;
}) {
  const [angle, setAngle] = useState(45);
  const [predicted, setPredicted] = useState(false);

  const record = getLesson(category, lesson);

  const name =
    record?.title ??
    categories[category].lessons.find((x) => slugify(x) === lesson) ??
    "Quantum exploration";

  const state = qubitStateFromPolarAngle(angle);

  return (
    <section className="lab-grid min-h-[calc(100vh-64px)] px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-center justify-between">
          <Link
            href={`/learn/${category}`}
            className="text-sm text-slate-500 transition hover:text-cyan-600"
          >
            ← {categories[category].label}
          </Link>

          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-mono text-cyan-700">
            LESSON 03 · {record?.estimatedTime ?? 18} MIN
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">
              Visualize · {categories[category].eyebrow}
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {name}
            </h1>

            <p className="mt-3 max-w-xl text-slate-600">
              {record?.description ??
                "Rotate a qubit, then predict what a measurement will reveal."}
            </p>

            <div className="panel mt-7 overflow-hidden rounded-3xl">
              <div className="flex items-center justify-between border-b border-cyan-100 px-5 py-4">
                <span className="text-sm font-semibold text-slate-900">
                  State explorer
                </span>

                <span className="font-mono text-[10px] text-cyan-600">
                  INTERACTIVE
                </span>
              </div>

              <div className="grid min-h-[360px] items-center gap-3 p-6 md:grid-cols-[1fr_230px]">
                <StateVector state={state} />

                <div>
                  <p className="font-mono text-xs text-cyan-600">
                    STATE ROTATION · {angle}°
                  </p>

                  <input
                    aria-label="State rotation"
                    type="range"
                    min="0"
                    max="180"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="mt-4 w-full accent-cyan-500"
                  />

                  <div className="mt-7 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                    <ProbabilityDistribution state={state} limit={2} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="panel rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Make a prediction
                </p>

                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Will this qubit measure as 0 or 1?
                </h2>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setPredicted(true)}
                    className="rounded-lg border border-cyan-200 px-4 py-2 text-sm transition hover:border-cyan-400 hover:bg-cyan-50"
                  >
                    Mostly |0⟩
                  </button>

                  <button
                    onClick={() => setPredicted(true)}
                    className="rounded-lg border border-violet-200 px-4 py-2 text-sm transition hover:border-violet-400 hover:bg-violet-50"
                  >
                    Mostly |1⟩
                  </button>
                </div>

                {predicted && (
                  <p className="mt-4 text-sm text-cyan-700">
                    Good instinct. Now run repeated measurements to test it.
                  </p>
                )}
              </div>

              <div className="panel rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                  What&apos;s happening?
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The state vector is produced by the simulator; its orientation
                  determines outcome probabilities.
                </p>
              </div>
            </div>
          </div>

          <aside className="panel h-fit rounded-2xl p-3">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
              Your experiment
            </p>

            {(record?.sections ?? []).map((section, i) => (
              <div
                key={section.id}
                className={`rounded-xl px-3 py-3 text-sm ${
                  i < 2
                    ? "bg-cyan-50 font-medium text-cyan-800"
                    : "text-slate-500"
                }`}
              >
                {section.title}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}

function Workbench({ simulator }: { simulator: boolean }) {
  return (
    <section className="lab-grid min-h-[calc(100vh-64px)] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-600">
          Open laboratory
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          {simulator ? "State simulator" : "Circuit playground"}
        </h1>

        <p className="mt-2 mb-8 max-w-xl text-slate-600">
          {simulator
            ? "Build a circuit, then inspect the quantum state after every gate."
            : "Compose a circuit without coupling editor controls to simulation data."}
        </p>

        <CircuitEditor />
      </div>
    </section>
  );
}
