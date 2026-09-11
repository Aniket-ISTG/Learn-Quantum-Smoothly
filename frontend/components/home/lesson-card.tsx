"use client";

import Link from "next/link";
import type { PathLesson } from "@/data/learning-path";
import { lessonHref } from "@/data/learning-path";

export type LessonState = "completed" | "current" | "upcoming" | "locked";

type LessonCardProps = {
  lesson: PathLesson;
  state: LessonState;
  compact?: boolean;
  onStart?: () => void;
};

const difficultyLabel = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export function LessonCard({
  lesson,
  state,
  compact = false,
  onStart,
}: LessonCardProps) {
  const href = lessonHref(lesson);
  const isLocked = state === "locked";

  const stateStyles = {
    completed: "border-emerald-200 bg-emerald-50/50",
    current:
      "border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 ring-2 ring-cyan-200/60",
    upcoming: "border-slate-200 bg-white",
    locked: "border-slate-100 bg-slate-50/80 opacity-70",
  };

  const buttonLabel =
    state === "completed"
      ? "Review"
      : state === "current"
        ? "Continue"
        : state === "locked"
          ? "Locked"
          : "Start Lesson";

  const content = (
    <article
      className={`panel panel-hover relative flex flex-col rounded-2xl border p-5 ${stateStyles[state]} ${
        compact ? "w-[280px]" : "w-[300px] sm:w-[320px]"
      }`}
    >
      {state === "current" && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Current
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <span
          className={`font-mono text-2xl font-bold ${
            state === "completed"
              ? "text-emerald-500"
              : state === "locked"
                ? "text-slate-300"
                : "text-cyan-500"
          }`}
        >
          {state === "completed" ? "✓" : String(lesson.number).padStart(2, "0")}
        </span>

        {state === "locked" && (
          <span className="text-slate-400" aria-hidden="true">
            🔒
          </span>
        )}
      </div>

      <h3
        className={`mt-3 text-lg font-semibold leading-snug ${
          isLocked ? "text-slate-400" : "text-slate-900"
        }`}
      >
        {lesson.title}
      </h3>

      <p
        className={`mt-2 flex-1 text-sm leading-relaxed ${
          isLocked ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {lesson.description}
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <span
          className={
            lesson.difficulty === "beginner"
              ? "text-cyan-600"
              : lesson.difficulty === "intermediate"
                ? "text-blue-600"
                : "text-violet-600"
          }
        >
          {difficultyLabel[lesson.difficulty]}
        </span>
        <span>·</span>
        <span>{lesson.estimatedMinutes} min</span>
      </div>

      {state === "completed" && (
        <div className="mt-3 progress-bar">
          <div className="progress-bar-fill w-full" />
        </div>
      )}

      {state === "current" && (
        <div className="mt-3 progress-bar">
          <div className="progress-bar-fill w-1/3" />
        </div>
      )}

      <div className="mt-4">
        {isLocked ? (
          <span className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400">
            {buttonLabel}
          </span>
        ) : (
          <span
            className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              state === "current"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                : state === "completed"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border border-cyan-200 bg-white text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50"
            }`}
          >
            {buttonLabel} →
          </span>
        )}
      </div>
    </article>
  );

  if (isLocked) return content;

  return (
    <Link href={href} onClick={onStart} className="block no-underline">
      {content}
    </Link>
  );
}
