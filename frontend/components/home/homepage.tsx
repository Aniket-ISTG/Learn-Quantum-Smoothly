"use client";

import Link from "next/link";
import { useMemo, useState, useRef } from "react";
import {
  quantumLearningPath,
  mathLearningPath,
  allHomepageLessons,
  lessonHref,
  type PathLesson,
} from "@/data/learning-path";
import { categoryKeys, categories } from "@/data/categories";
import { useProgress } from "@/lib/progress";
import { LessonCard } from "./lesson-card";

function QubitOrb({ angle = 45, small = false }: { angle?: number; small?: boolean }) {
  return (
    <div className={`relative flex flex-col items-center justify-center ${small ? "h-36 w-36" : "h-[240px] w-[240px]"}`}>
      <div
        className="pulse-ring absolute inset-[12%] rounded-full border border-cyan-300/50"
      />
      <div className="absolute inset-[16%] rounded-full border border-cyan-200/70" />
      <div
        className="orbit absolute inset-[6%] rounded-full border-2 border-violet-400/60 border-l-transparent"
        style={{ transform: `rotate(${angle * 2}deg)` }}
      />
      
      {/* Qubit Vector Line */}
      <div
        className="absolute h-1/2 w-0.5 origin-bottom bg-gradient-to-t from-cyan-500 to-violet-500 transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-50%) rotate(${angle}deg)` }}
      >
        <div className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_15px_4px_rgba(6,182,212,0.6)]" />
      </div>

      <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900 border-2 border-cyan-400 shadow-md" />
      <div className="absolute inset-[20%] rounded-full border border-dashed border-cyan-300/40" />
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
      {children}
    </p>
  );
}

function PathScroll({
  lessons,
  title,
  subtitle,
}: {
  lessons: PathLesson[];
  title: string;
  subtitle: string;
}) {
  const { getLessonState, markStarted, completionPercent } = useProgress();
  const orderedIds = lessons.map((l) => l.id);
  const percent = completionPercent(orderedIds);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  const filteredLessons = lessons.filter(
    (l) => filter === "all" || l.difficulty === filter
  );

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const amount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionEyebrow>{title}</SectionEyebrow>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {subtitle}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Difficulty Filter Pills */}
            <div className="flex rounded-xl border border-cyan-100 bg-white p-1 text-xs font-medium shadow-sm">
              {(["all", "beginner", "intermediate", "advanced"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setFilter(d)}
                  className={`rounded-lg px-3 py-1.5 capitalize transition ${
                    filter === d
                      ? "bg-cyan-500 text-white font-semibold shadow-sm"
                      : "text-slate-600 hover:text-cyan-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Scroll Navigation Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleScroll("left")}
                aria-label="Scroll left"
                className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-200 bg-white text-slate-600 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600"
              >
                ←
              </button>
              <button
                onClick={() => handleScroll("right")}
                aria-label="Scroll right"
                className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-200 bg-white text-slate-600 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600"
              >
                →
              </button>
            </div>

            {/* Path Progress Ring */}
            <div className="flex items-center gap-3 border-l border-cyan-100 pl-4">
              <div className="text-right">
                <p className="text-xs text-slate-500">Path progress</p>
                <p className="font-mono text-lg font-bold text-cyan-600">
                  {percent}%
                </p>
              </div>
              <div className="h-11 w-11 rounded-full border-4 border-cyan-100">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="rgba(6,182,212,0.15)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="3"
                    strokeDasharray={`${percent} 100`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="mt-8 scroll-path"
        >
          {filteredLessons.map((lesson, i) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              state={getLessonState(lesson.id, i, orderedIds)}
              onStart={() => markStarted(lesson.id)}
            />
          ))}
        </div>

        <div className="mt-4 circuit-line" />
      </div>
    </section>
  );
}

export function Homepage() {
  const { progress, getLessonState, completionPercent, markStarted } =
    useProgress();

  const [heroAngle, setHeroAngle] = useState(45);
  const [measuredResult, setMeasuredResult] = useState<string | null>(null);

  const quantumIds = quantumLearningPath.map((l) => l.id);
  const overallPercent = completionPercent(quantumIds);

  const continueLesson = useMemo(() => {
    const last = progress.lastVisited
      ? quantumLearningPath.find((l) => l.id === progress.lastVisited)
      : null;
    if (last && !progress.completed.includes(last.id)) return last;
    const firstIncomplete = quantumLearningPath.find(
      (l) => !progress.completed.includes(l.id),
    );
    return firstIncomplete ?? quantumLearningPath[0];
  }, [progress]);

  const completedCount = quantumIds.filter((id) =>
    progress.completed.includes(id),
  ).length;

  const handleMeasureHero = () => {
    const rad = (heroAngle * Math.PI) / 180;
    const p1 = Math.sin(rad / 2) ** 2;
    const result = Math.random() < p1 ? "|1⟩" : "|0⟩";
    setMeasuredResult(result);
  };

  const p0 = Math.round((Math.cos((heroAngle * Math.PI) / 360) ** 2) * 100);
  const p1 = 100 - p0;

  return (
    <>
      {/* Hero */}
      <section className="aurora lab-grid relative overflow-hidden px-5 pb-16 pt-12 sm:pt-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/60 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
              Interactive quantum learning laboratory
            </div>

            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
              Learn quantum computing{" "}
              <span className="gradient-text">by doing.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Explore lessons, build circuits, and develop real quantum
              intuition — all in one place. Start where you are, progress at
              your pace.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={lessonHref(continueLesson)} className="btn-primary">
                {completedCount > 0 ? "Continue learning" : "Start first lesson"} →
              </Link>
              <Link href="#learning-path" className="btn-secondary">
                Browse lessons
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 border-t border-cyan-100 pt-6">
              {[
                ["49", "lessons"],
                ["6", "learning tracks"],
                ["3", "interactive tools"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-mono text-xl font-bold text-slate-900">
                    {value}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{label}</div>
                </div>
              ))}
              <div>
                <div className="font-mono text-xl font-bold text-cyan-600">
                  {overallPercent}%
                </div>
                <div className="mt-0.5 text-xs text-slate-500">your progress</div>
              </div>
            </div>
          </div>

          <div className="panel relative mx-auto flex w-full max-w-[440px] flex-col items-center overflow-hidden rounded-3xl p-6">
            <div className="flex w-full justify-between items-center font-mono text-[11px] text-slate-400 border-b border-cyan-100/80 pb-3">
              <span className="font-bold text-cyan-700">LIVE QUBIT EXPLORER</span>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-cyan-700 font-semibold">
                INTERACTIVE
              </span>
            </div>
            
            <div className="my-4">
              <QubitOrb angle={heroAngle} />
            </div>

            {/* Live Interactive Qubit Controls */}
            <div className="w-full rounded-2xl border border-cyan-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Qubit Rotation Angle</span>
                <span className="font-mono text-cyan-700 font-bold">{heroAngle}°</span>
              </div>

              <input
                aria-label="Qubit rotation angle"
                type="range"
                min="0"
                max="180"
                value={heroAngle}
                onChange={(e) => setHeroAngle(Number(e.target.value))}
                className="mt-2 w-full accent-cyan-500 cursor-pointer"
              />

              <div className="mt-3 flex gap-1.5">
                <button
                  onClick={() => setHeroAngle(0)}
                  className="flex-1 rounded-lg border border-cyan-200 bg-white py-1 text-[11px] font-mono font-semibold text-slate-700 transition hover:bg-cyan-50"
                >
                  |0⟩
                </button>
                <button
                  onClick={() => setHeroAngle(90)}
                  className="flex-1 rounded-lg border border-cyan-200 bg-white py-1 text-[11px] font-mono font-semibold text-cyan-700 transition hover:bg-cyan-50"
                >
                  H Gate (|+⟩)
                </button>
                <button
                  onClick={() => setHeroAngle(180)}
                  className="flex-1 rounded-lg border border-violet-200 bg-white py-1 text-[11px] font-mono font-semibold text-violet-700 transition hover:bg-violet-50"
                >
                  |1⟩
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[11px]">
                <span className="text-cyan-700 font-semibold">P(|0⟩): {p0}%</span>
                <button
                  onClick={handleMeasureHero}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1 text-white font-sans text-xs font-bold shadow-sm transition hover:opacity-90 active:scale-95"
                >
                  Measure Qubit ⚡
                </button>
                <span className="text-violet-700 font-semibold">P(|1⟩): {p1}%</span>
              </div>

              {measuredResult && (
                <div className="mt-2 text-center text-xs font-bold text-cyan-700">
                  Measured Outcome: <span className="font-mono text-base text-violet-700">{measuredResult}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path — horizontal scroll */}
      <div id="learning-path">
        <PathScroll
          title="Quantum Learning Path"
          subtitle="From qubits to quantum circuits"
          lessons={quantumLearningPath}
        />
      </div>

      {/* Continue Learning */}
      <section className="border-y border-cyan-50 bg-gradient-to-r from-cyan-50/50 via-blue-50/30 to-violet-50/30 px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <SectionEyebrow>Continue learning</SectionEyebrow>
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                Pick up where you left off
              </h2>
              <p className="mt-2 max-w-lg text-slate-600">
                {completedCount === 0
                  ? "You haven't started yet — your first lesson is ready."
                  : `You've completed ${completedCount} of ${quantumLearningPath.length} lessons in the fundamentals track.`}
              </p>
              <div className="mt-5 progress-bar max-w-md">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {overallPercent}% complete · {quantumLearningPath.length - completedCount} lessons remaining
              </p>
            </div>

            <Link
              href={lessonHref(continueLesson)}
              onClick={() => markStarted(continueLesson.id)}
              className="panel panel-hover block max-w-sm rounded-2xl border-2 border-cyan-200 bg-white p-6 no-underline"
            >
              <span className="font-mono text-xs text-cyan-600">
                Lesson {String(continueLesson.number).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {continueLesson.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {continueLesson.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-600">
                Continue →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* All Lessons by Track */}
      <section id="lessons" className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionEyebrow>All lessons</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Explore every learning track
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Six curated paths from math foundations to fault-tolerant quantum
            computing.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryKeys.map((key, i) => {
              const cat = categories[key];
              return (
                <Link
                  key={key}
                  href={`/learn/${key}`}
                  className="panel panel-hover group flex flex-col rounded-2xl p-5 no-underline"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-mono text-sm font-bold"
                      style={{
                        color: cat.color,
                        background: `${cat.color}15`,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: cat.color }}
                      >
                        {cat.eyebrow}
                      </p>
                      <h3 className="font-semibold text-slate-900 group-hover:text-cyan-700">
                        {cat.label}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {cat.lessons.length} lessons · {cat.time}
                  </p>
                  <span className="mt-4 text-sm font-medium text-cyan-600 opacity-0 transition group-hover:opacity-100">
                    View track →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features / Pedagogy */}
      <section className="border-t border-cyan-50 bg-white px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionEyebrow>How you learn</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Learn in the order your mind wants to
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Visualize", "Watch a quantum idea unfold in space.", "👁"],
              ["02", "Interact", "Touch the variables. Change the outcome.", "⚡"],
              ["03", "Predict", "Commit to an answer before you run it.", "🎯"],
              ["04", "Understand", "Reveal the physics when it clicks.", "💡"],
            ].map(([num, title, desc, icon]) => (
              <div
                key={title}
                className="panel panel-hover rounded-2xl p-5 transition"
              >
                <span className="text-2xl">{icon}</span>
                <span className="mt-4 block font-mono text-xs text-cyan-600">
                  {num}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Math path scroll */}
      <PathScroll
        title="Math foundations"
        subtitle="Build the tools before the quantum rules"
        lessons={mathLearningPath}
      />

      {/* Playground */}
      <section id="playground" className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="panel overflow-hidden rounded-3xl">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-10">
                <SectionEyebrow>Playground</SectionEyebrow>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Build quantum circuits freely
                </h2>
                <p className="mt-3 text-slate-600">
                  Drag gates, wire qubits, and experiment without limits. The
                  playground is your open laboratory for trying ideas.
                </p>
                <Link href="/playground" className="btn-primary mt-6">
                  Open playground →
                </Link>
              </div>
              <div className="relative flex min-h-[200px] items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 p-8">
                <div className="grid grid-cols-4 gap-3">
                  {["H", "X", "Z", "CNOT"].map((gate) => (
                    <div
                      key={gate}
                      className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-200 bg-white font-mono text-sm font-bold text-cyan-700 shadow-sm"
                    >
                      {gate}
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-8 top-1/2 circuit-line" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simulator */}
      <section id="simulator" className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="panel overflow-hidden rounded-3xl border-violet-100">
            <div className="grid lg:grid-cols-2">
              <div className="relative flex min-h-[200px] items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50 p-8">
                <QubitOrb small />
              </div>
              <div className="p-8 sm:p-10">
                <SectionEyebrow>State simulator</SectionEyebrow>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Inspect quantum states step by step
                </h2>
                <p className="mt-3 text-slate-600">
                  Build a circuit and watch the state vector evolve after every
                  gate. See amplitudes, probabilities, and the Bloch sphere in
                  real time.
                </p>
                <Link href="/playground" className="btn-secondary mt-6">
                  Try in playground →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tutor */}
      <section id="ai-tutor" className="border-t border-cyan-50 bg-gradient-to-b from-white to-cyan-50/30 px-5 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <SectionEyebrow>AI Tutor</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Stuck? Ask the quantum tutor
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            A floating AI assistant is available on every page. Ask about
            concepts, get hints on challenges, or explore ideas deeper.
          </p>
          <div className="mx-auto mt-8 flex max-w-sm items-center gap-4 rounded-2xl border border-cyan-200 bg-white p-4 shadow-sm">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xl text-white">
              ✦
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">
                Click the ✦ button
              </p>
              <p className="text-xs text-slate-500">
                Bottom-right corner · Available now
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress */}
      <section id="progress" className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <SectionEyebrow>Your progress</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Track your quantum journey
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Lessons completed",
                value: completedCount,
                total: quantumLearningPath.length,
              },
              {
                label: "Lessons started",
                value: progress.started.length,
                total: allHomepageLessons.length,
              },
              {
                label: "Overall progress",
                value: `${overallPercent}%`,
                total: null,
              },
            ].map((stat) => (
              <div key={stat.label} className="panel rounded-2xl p-6">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 font-mono text-3xl font-bold text-slate-900">
                  {stat.value}
                  {stat.total && (
                    <span className="text-lg text-slate-400">
                      {" "}
                      / {stat.total}
                    </span>
                  )}
                </p>
                {stat.total && (
                  <div className="mt-3 progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.round((Number(stat.value) / stat.total) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 scroll-path">
            {quantumLearningPath.map((lesson, i) => (
              <LessonCard
                key={`progress-${lesson.id}`}
                lesson={lesson}
                state={getLessonState(lesson.id, i, quantumIds)}
                compact
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-20 pt-4">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-8 py-12 text-center text-white sm:px-16 sm:py-16">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to enter the lab?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-cyan-50/90">
              Start with the fundamentals or jump into the playground. Your
              quantum journey begins with a single qubit.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={lessonHref(quantumLearningPath[0])}
                className="inline-flex items-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-cyan-700 transition hover:bg-cyan-50"
              >
                Start first lesson →
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
