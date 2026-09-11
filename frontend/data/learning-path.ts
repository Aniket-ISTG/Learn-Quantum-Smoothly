import { categories, slugify, type Category } from "./categories";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type PathLesson = {
  id: string;
  number: number;
  title: string;
  description: string;
  category: Category;
  slug: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
};

const descriptions: Record<string, string> = {
  "classical-bits-vs-qubits":
    "Understand the basic building block of quantum computing.",
  "quantum-states": "Learn how qubits are represented as state vectors.",
  superposition: "Explore how a qubit can exist in multiple states at once.",
  measurement: "Discover what happens when you observe a quantum state.",
  "dirac-notation": "Master the compact language of quantum mechanics.",
  "bloch-sphere": "Visualize any single-qubit state on the Bloch sphere.",
  "single-qubit-gates": "Apply rotations and flips to change qubit states.",
  "basic-quantum-circuits": "Build your first circuits with gates and wires.",
  "complex-numbers": "Represent amplitudes with real and imaginary parts.",
  vectors: "Use arrows to describe direction and magnitude.",
  matrices: "Transform vectors with rows and columns of numbers.",
};

const difficulties: Record<Category, Difficulty> = {
  math: "beginner",
  fundamentals: "beginner",
  core: "intermediate",
  algorithms: "advanced",
  nisq: "intermediate",
  advanced: "advanced",
};

const timeEstimates: Record<Category, number> = {
  math: 25,
  fundamentals: 18,
  core: 30,
  algorithms: 45,
  nisq: 25,
  advanced: 40,
};

function buildPath(category: Category, count: number): PathLesson[] {
  return categories[category].lessons.slice(0, count).map((title, i) => {
    const slug = slugify(title);
    return {
      id: `${category}/${slug}`,
      number: i + 1,
      title,
      description:
        descriptions[slug] ??
        "Explore, experiment, and build quantum intuition.",
      category,
      slug,
      difficulty: difficulties[category],
      estimatedMinutes: timeEstimates[category],
    };
  });
}

/** Primary quantum learning path shown on the homepage. */
export const quantumLearningPath: PathLesson[] = buildPath("fundamentals", 8);

/** Math prerequisites path — first 4 lessons. */
export const mathLearningPath: PathLesson[] = buildPath("math", 4);

export const allHomepageLessons: PathLesson[] = [
  ...quantumLearningPath,
  ...buildPath("core", 4),
];

export function lessonHref(lesson: PathLesson) {
  return `/learn/${lesson.category}/${lesson.slug}`;
}
