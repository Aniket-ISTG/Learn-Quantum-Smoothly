"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/quantum/supabase";
import { StateVector } from "@/components/quantum/visualization/state-vector";
import { ProbabilityDistribution } from "@/components/quantum/visualization/probability-distribution";
import { getLesson } from "@/data/lessons";
import { MathFoundations } from "@/components/math/math-foundations";
import { MathLesson } from "@/components/math/math-lesson";

type View =
  | "home"
  | "roadmap"
  | "category"
  | "lesson"
  | "playground"
  | "simulator";

type Category =
  | "math"
  | "fundamentals"
  | "core"
  | "algorithms"
  | "nisq"
  | "advanced";

const categories: Record<
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
    color: "#53d7e7",
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
    color: "#9d7bff",
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
    color: "#ffae67",
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
    color: "#64d99c",
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
    color: "#f070ac",
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
    color: "#7ca6ff",
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

const keys = Object.keys(categories) as Category[];

const slug = (x: string) =>
  x
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#06101d]/80 px-5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-bold tracking-tight"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-300 text-lg text-slate-950">
            ◈
          </span>

          qubit<span className="text-cyan-300">lab</span>
        </Link>

        <nav className="hidden gap-7 text-sm text-slate-300 md:flex">
          <Link href="/learn" className="hover:text-cyan-300">
            Learn
          </Link>

          <Link href="/playground" className="hover:text-cyan-300">
            Playground
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-200"
          >
            Enter the lab →
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:text-red-300"
          >
            Logout
          </button>
        </div>

      </div>
    </header>
  );
}

function Orb({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`relative ${
        small ? "h-36 w-36" : "h-[310px] w-[310px]"
      }`}
    >
      <div className="pulse-ring absolute inset-[16%] rounded-full border border-cyan-300/30" />
      <div className="absolute inset-[16%] rounded-full border border-cyan-200/50" />
      <div className="orbit absolute inset-[7%] rounded-full border border-violet-300/60 border-l-transparent" />

      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_30px_10px_rgba(85,232,255,.6)]" />

      <div className="absolute left-[28%] top-[23%] h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_15px_5px_rgba(157,123,255,.6)]" />

      <div className="absolute inset-[16%] rounded-full border border-dashed border-slate-400/30" />
    </div>
  );
}

export function QuantumLab({
  view,
  category = "fundamentals",
  lesson = "superposition",
}: {
  view: View;
  category?: Category;
  lesson?: string;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#06101d] text-slate-100">
      <Header />

      {view === "home" && <Home />}
      {view === "roadmap" && <Roadmap />}
      {view === "category" && (category === "math" ? <MathFoundations /> : <CategoryPage category={category} />)}
      {view === "lesson" && (category === "math" ? (
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

function Home() {
  return (
    <>
      <section className="aurora lab-grid relative overflow-hidden px-5 pb-20 pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.06fr_.94fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-300/[.07] px-3 py-1.5 text-xs text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              Interactive quantum learning laboratory
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.055em] text-white sm:text-7xl">
              Don’t just learn quantum.
              <br />
              <span className="text-cyan-300">Make it happen.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              A hands-on space for seeing superposition, shaping circuits, and
              developing real quantum intuition before the equations arrive.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/learn/fundamentals/superposition"
                className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950"
              >
                Start your first experiment →
              </Link>

              <Link
                href="/playground"
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200"
              >
                Explore the playground
              </Link>
            </div>

            <div className="mt-12 flex gap-8 border-t border-white/10 pt-7">
              {[
                ["35", "interactive lessons"],
                ["12", "quantum challenges"],
                ["∞", "experiments"],
              ].map(([a, b]) => (
                <div key={b}>
                  <div className="font-mono text-xl font-bold">{a}</div>
                  <div className="mt-1 text-xs text-slate-500">{b}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel relative mx-auto flex w-full max-w-[470px] items-center justify-center overflow-hidden rounded-3xl px-5 py-10">
            <div className="absolute inset-x-0 top-0 flex justify-between p-5 font-mono text-[10px] text-slate-500">
              <span>QUBIT STATE</span>
              <span className="text-cyan-300">LIVE</span>
            </div>

            <Orb />

            <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/10 bg-[#091827]/80 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Superposition</span>
                <span className="text-cyan-300">|ψ⟩</span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 bg-gradient-to-r from-cyan-300 to-violet-400" />
              </div>

              <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-400">
                <span>|0⟩ 50%</span>
                <span>|1⟩ 50%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">
            A different way in
          </p>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Learn in the order your mind wants to.
            </h2>

            <Link href="/learn" className="text-sm text-cyan-200">
              See learning roadmap →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              ["01", "Visualize", "Watch a quantum idea unfold in space."],
              ["02", "Interact", "Touch the variables. Change the outcome."],
              ["03", "Predict", "Commit to an answer before you run it."],
              ["04", "Understand", "Reveal the physics and math when it clicks."],
            ].map(([n, t, d]) => (
              <div key={t} className="panel rounded-2xl p-5">
                <span className="font-mono text-xs text-cyan-300">{n}</span>

                <h3 className="mt-10 text-lg font-semibold">{t}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Roadmap() {
  return (
    <section className="aurora lab-grid min-h-[calc(100vh-64px)] px-5 py-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">
          Learning map
        </p>

        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Build your quantum intuition, one experiment at a time.
        </h1>

        <p className="mt-4 max-w-xl leading-7 text-slate-400">
          Follow the signal from mathematical tools to fault-tolerant systems.
          Every track opens with something you can explore.
        </p>

        <div className="mt-12 space-y-3">
          {keys.map((key, i) => {
            const c = categories[key];

            return (
              <Link
                href={`/learn/${key}`}
                key={key}
                className="panel group flex items-center gap-4 rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-white/25 sm:gap-7"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-mono text-sm"
                  style={{
                    color: c.color,
                    background: `${c.color}17`,
                  }}
                >
                  0{i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs uppercase tracking-wider"
                    style={{ color: c.color }}
                  >
                    {c.eyebrow}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">{c.label}</h2>
                </div>

                <div className="hidden text-xs text-slate-500 sm:block">
                  {c.time}
                </div>

                <span className="text-slate-500 group-hover:text-white">
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
          className="text-sm text-slate-400 hover:text-cyan-200"
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

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {c.label}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Start with a phenomenon, make a prediction, then uncover the
              rules that shape it.
            </p>
          </div>

          <div className="panel self-end rounded-xl px-5 py-4 text-sm text-slate-400">
            <b className="text-white">{c.lessons.length} lessons</b>
            <br />
            {c.time}
          </div>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {c.lessons.map((name, i) => (
            <Link
              key={name}
              href={`/learn/${category}/${slug(name)}`}
              className="panel group flex min-h-28 items-center gap-4 rounded-2xl p-5 hover:border-white/25"
            >
              <span
                className="font-mono text-xs"
                style={{ color: c.color }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex-1">
                <h2 className="font-semibold">{name}</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Explore · experiment · explain
                </p>
              </div>

              <span className="text-slate-600 group-hover:text-white">
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
    categories[category].lessons.find((x) => slug(x) === lesson) ??
    "Quantum exploration";

  const state = qubitStateFromPolarAngle(angle);

  return (
    <section className="lab-grid min-h-[calc(100vh-64px)] px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-center justify-between">
          <Link
            href={`/learn/${category}`}
            className="text-sm text-slate-400 hover:text-cyan-200"
          >
            ← {categories[category].label}
          </Link>

          <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-[11px] font-mono text-cyan-200">
            LESSON 03 · {record?.estimatedTime ?? 18} MIN
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">
              Visualize · {categories[category].eyebrow}
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {name}
            </h1>

            <p className="mt-3 max-w-xl text-slate-400">
              {record?.description ??
                "Rotate a qubit, then predict what a measurement will reveal."}
            </p>

            <div className="panel mt-7 overflow-hidden rounded-3xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span className="text-sm font-semibold">State explorer</span>

                <span className="font-mono text-[10px] text-cyan-200">
                  INTERACTIVE
                </span>
              </div>

              <div className="grid min-h-[360px] items-center gap-3 p-6 md:grid-cols-[1fr_230px]">
                <StateVector state={state} />

                <div>
                  <p className="font-mono text-xs text-cyan-200">
                    STATE ROTATION · {angle}°
                  </p>

                  <input
                    aria-label="State rotation"
                    type="range"
                    min="0"
                    max="180"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="mt-4 w-full accent-cyan-300"
                  />

                  <div className="mt-7 rounded-xl border border-white/10 bg-black/10 p-4">
                    <ProbabilityDistribution state={state} limit={2} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="panel rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
                  Make a prediction
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  Will this qubit measure as 0 or 1?
                </h2>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setPredicted(true)}
                    className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-cyan-300"
                  >
                    Mostly |0⟩
                  </button>

                  <button
                    onClick={() => setPredicted(true)}
                    className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-violet-300"
                  >
                    Mostly |1⟩
                  </button>
                </div>

                {predicted && (
                  <p className="mt-4 text-sm text-cyan-200">
                    Good instinct. Now run repeated measurements to test it.
                  </p>
                )}
              </div>

              <div className="panel rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  What’s happening?
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The state vector is produced by the simulator; its
                  orientation determines outcome probabilities.
                </p>
              </div>
            </div>
          </div>

          <aside className="panel h-fit rounded-2xl p-3">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">
              Your experiment
            </p>

            {(record?.sections ?? []).map((section, i) => (
              <div
                key={section.id}
                className={`rounded-xl px-3 py-3 text-sm ${
                  i < 2
                    ? "bg-cyan-300/10 text-cyan-100"
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
        <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">
          Open laboratory
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {simulator ? "State simulator" : "Circuit playground"}
        </h1>

        <p className="mt-2 mb-8 max-w-xl text-slate-400">
          {simulator
            ? "Build a circuit, then inspect the quantum state after every gate."
            : "Compose a circuit without coupling editor controls to simulation data."}
        </p>

        <CircuitEditor />
      </div>
    </section>
  );
}