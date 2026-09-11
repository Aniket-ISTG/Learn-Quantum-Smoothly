"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "qubitlab-progress";

export type LessonProgress = {
  completed: string[];
  started: string[];
  lastVisited: string | null;
};

const defaultProgress: LessonProgress = {
  completed: [],
  started: [],
  lastVisited: null,
};

function readProgress(): LessonProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return defaultProgress;
  }
}

function writeProgress(progress: LessonProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const [progress, setProgress] = useState<LessonProgress>(defaultProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(readProgress());
    setReady(true);
  }, []);

  const persist = useCallback((next: LessonProgress) => {
    setProgress(next);
    writeProgress(next);
  }, []);

  const markStarted = useCallback(
    (lessonId: string) => {
      const current = readProgress();
      if (current.started.includes(lessonId)) return;
      persist({
        ...current,
        started: [...current.started, lessonId],
        lastVisited: lessonId,
      });
    },
    [persist],
  );

  const markCompleted = useCallback(
    (lessonId: string) => {
      const current = readProgress();
      const started = current.started.includes(lessonId)
        ? current.started
        : [...current.started, lessonId];
      const completed = current.completed.includes(lessonId)
        ? current.completed
        : [...current.completed, lessonId];
      persist({ ...current, started, completed, lastVisited: lessonId });
    },
    [persist],
  );

  const getLessonState = useCallback(
    (lessonId: string, index: number, orderedIds: string[]) => {
      if (progress.completed.includes(lessonId)) return "completed" as const;
      const prevId = orderedIds[index - 1];
      if (index > 0 && prevId && !progress.completed.includes(prevId)) {
        return "locked" as const;
      }
      if (
        progress.started.includes(lessonId) ||
        progress.lastVisited === lessonId
      ) {
        return "current" as const;
      }
      const firstIncomplete = orderedIds.find(
        (id) => !progress.completed.includes(id),
      );
      if (firstIncomplete === lessonId) return "current" as const;
      return "upcoming" as const;
    },
    [progress],
  );

  const completionPercent = useCallback(
    (lessonIds: string[]) => {
      if (lessonIds.length === 0) return 0;
      const done = lessonIds.filter((id) =>
        progress.completed.includes(id),
      ).length;
      return Math.round((done / lessonIds.length) * 100);
    },
    [progress],
  );

  return {
    progress,
    ready,
    markStarted,
    markCompleted,
    getLessonState,
    completionPercent,
  };
}
