const { object, list, text } = require("./helpers.js");

function parseCircuitAnalysis(value, deterministicIssues) {
  const data = object(value);

  const rawIssues = list(data?.issues)
    .map(object)
    .filter(Boolean);

  const issues = rawIssues.map((issue) => ({
    type: ["validation", "conceptual", "objective", "measurement"].includes(text(issue.type))
      ? text(issue.type)
      : "conceptual",
    severity: ["low", "medium", "high"].includes(text(issue.severity))
      ? text(issue.severity)
      : "medium",
    message: text(issue.message, "Potential circuit concern"),
    explanation: text(issue.explanation, "Review this circuit step carefully."),
    suggestion: text(issue.suggestion, "Try a small experiment to verify the result."),
  }));

  const status = deterministicIssues.some((issue) => issue.severity === "high")
    ? "error"
    : issues.length
      ? "warning"
      : "ok";

  return {
    status,
    summary: text(
      data?.summary,
      issues.length
        ? "The circuit has learning-oriented feedback to review."
        : "No issues were identified."
    ),
    issues,
    deterministicIssues,
  };
}

function parseOptimization(value) {
  const data = object(value);

  return {
    summary: text(data?.summary, "Review each suggestion before changing your circuit."),
    suggestions: list(data?.suggestions)
      .map(object)
      .filter(Boolean)
      .map((item) => ({
        description: text(item.description, "Simplify this circuit step."),
        reason: text(item.reason, "This may reduce unnecessary operations."),
        affectedGates: list(item.affectedGates).filter((gate) => typeof gate === "string").slice(0, 20),
        confidence: ["low", "medium", "high"].includes(text(item.confidence))
          ? text(item.confidence)
          : "medium",
      })),
  };
}

function parseLearningPath(value) {
  const data = object(value);

  return {
    summary: text(data?.summary, "Here is a focused next step for your learning."),
    recommendations: list(data?.recommendations)
      .map(object)
      .filter(Boolean)
      .map((item) => ({
        lessonId: text(item.lessonId),
        title: text(item.title, "Recommended practice"),
        reason: text(item.reason, "This supports your current learning objective."),
        priority: ["low", "medium", "high"].includes(text(item.priority))
          ? text(item.priority)
          : "medium",
        action: text(item.action, "Open the lesson and try one small experiment."),
      })),
  };
}

module.exports = { parseCircuitAnalysis, parseOptimization, parseLearningPath };
