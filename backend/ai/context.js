function buildAIContext({ pathname, section, circuit, simulationResult, learnerProgress }) {
  const segments = pathname.split("/").filter(Boolean);
  const isLesson = segments[0] === "learn" && segments.length >= 3;

  const lesson = isLesson
    ? {
        id: `${segments[1]}/${segments[2]}`,
        title: `Lesson: ${segments[2]}`,
        category: segments[1],
        difficulty: "beginner",
        estimatedTime: "10 min",
        description: "User is currently working through a lesson page.",
      }
    : undefined;

  const kind = isLesson
    ? "lesson"
    : pathname === "/playground"
      ? "playground"
      : pathname === "/simulator"
        ? "simulator"
        : pathname === "/learn"
          ? "roadmap"
          : "other";

  return {
    page: { pathname, kind },
    lesson,
    section,
    circuit,
    simulation: simulationResult && {
      probabilities: simulationResult.probabilities,
      measurementCounts: simulationResult.measurementCounts,
      executionSteps: simulationResult.executionSteps,
    },
    progress: learnerProgress,
  };
}

function compactContext(context) {
  return JSON.stringify(context, (_key, value) =>
    Array.isArray(value) && value.length > 16
      ? value.slice(0, 16)
      : value
  );
}

module.exports = { buildAIContext, compactContext };
