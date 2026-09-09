import type { Lesson } from "@/types/lesson";

export const superpositionLesson: Lesson = {
  id: "superposition", title: "Superposition", category: "fundamentals", difficulty: "beginner", estimatedTime: 18,
  description: "Rotate a qubit, predict a measurement, then reveal why probabilities change.", prerequisites: ["quantum-states"],
  sections: [
    { id: "visualize", type: "visualization", title: "State explorer", description: "Watch a state move between |0⟩ and |1⟩.", component: "StateVector" },
    { id: "predict", type: "prediction", title: "Make a prediction", description: "Commit to an outcome before you measure." },
    { id: "intuition", type: "explanation", title: "What is happening?", description: "A qubit is not choosing a side; its orientation determines outcome probabilities." },
    { id: "circuit", type: "circuit", title: "Build the circuit", description: "Use H to create an equal superposition.", component: "CircuitEditor" },
    { id: "challenge", type: "challenge", title: "Challenge", description: "Create a state that measures |1⟩ 75% of the time." },
  ],
};
