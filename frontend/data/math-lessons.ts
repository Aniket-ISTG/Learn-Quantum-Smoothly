export type MathStageId = "represent" | "transform" | "predict";

export type MathVisualizationKind =
  | "complex-plane"
  | "vector"
  | "matrix-transform"
  | "matrix-multiplication"
  | "inner-product"
  | "eigenvector"
  | "probability"
  | "tensor-product";

export type MathLessonRecord = {
  slug: string;
  title: string;
  stage: MathStageId;
  estimatedMinutes: number;
  summary: string;
  intuition: string;
  quantumConnection: string;
  outcomes: readonly string[];
  visualization: MathVisualizationKind;
  example: {
    prompt: string;
    steps: readonly string[];
    answer: string;
  };
};

export const mathStages: ReadonlyArray<{
  id: MathStageId;
  label: string;
  description: string;
}> = [
  {
    id: "represent",
    label: "Represent states",
    description: "Turn numbers into arrows that carry size and direction.",
  },
  {
    id: "transform",
    label: "Transform states",
    description: "Use matrices to move, compare, and understand vectors.",
  },
  {
    id: "predict",
    label: "Predict outcomes",
    description: "Convert amplitudes into chances and combine systems.",
  },
];

export const mathLessons: readonly MathLessonRecord[] = [
  {
    slug: "complex-numbers",
    title: "Complex Numbers",
    stage: "represent",
    estimatedMinutes: 25,
    summary: "Plot a real part and an imaginary part as one point on a plane.",
    intuition: "A complex number is an arrow: its length is magnitude and its angle is phase.",
    quantumConnection: "Quantum amplitudes are complex numbers; their phases determine how states interfere.",
    outcomes: [
      "Read a + bi as coordinates (a, b)",
      "Find magnitude from the Pythagorean theorem",
      "Interpret phase as the arrow's direction",
    ],
    visualization: "complex-plane",
    example: {
      prompt: "Plot z = 3 + 4i and find its magnitude.",
      steps: ["Move 3 units along the real axis.", "Move 4 units along the imaginary axis.", "Use |z| = √(3² + 4²)."],
      answer: "z is the point (3, 4), and |z| = 5.",
    },
  },
  {
    slug: "vectors",
    title: "Vectors",
    stage: "represent",
    estimatedMinutes: 30,
    summary: "Describe a state as an ordered list with a length and direction.",
    intuition: "A vector is an arrow whose components tell you how far it travels along each axis.",
    quantumConnection: "A qubit state is a two-component vector of amplitudes.",
    outcomes: [
      "Read vector components",
      "Add and scale vectors",
      "Normalize a vector to length 1",
    ],
    visualization: "vector",
    example: {
      prompt: "Normalize v = [3, 4].",
      steps: ["Find the length: √(3² + 4²) = 5.", "Divide each component by 5."],
      answer: "The unit vector is [3/5, 4/5] = [0.6, 0.8].",
    },
  },
  {
    slug: "matrices",
    title: "Matrices",
    stage: "transform",
    estimatedMinutes: 30,
    summary: "Read a matrix as a rule that transforms one vector into another.",
    intuition: "A matrix can stretch, flip, rotate, or mix an arrow's components.",
    quantumConnection: "Quantum gates are matrices that transform state vectors while preserving total probability.",
    outcomes: [
      "Identify rows, columns, and dimensions",
      "Multiply a 2×2 matrix by a vector",
      "Recognize common geometric transformations",
    ],
    visualization: "matrix-transform",
    example: {
      prompt: "Apply [[0, -1], [1, 0]] to [1, 0].",
      steps: ["First component: 0×1 + (−1)×0 = 0.", "Second component: 1×1 + 0×0 = 1."],
      answer: "The output is [0, 1]: the arrow rotated 90° counterclockwise.",
    },
  },
  {
    slug: "matrix-multiplication",
    title: "Matrix Multiplication",
    stage: "transform",
    estimatedMinutes: 35,
    summary: "Compose transformations by matching rows with columns.",
    intuition: "AB means do B first, then A; order can change the result.",
    quantumConnection: "A circuit's overall action is the ordered product of its gate matrices.",
    outcomes: [
      "Check whether matrix dimensions are compatible",
      "Compute entries with row-by-column products",
      "Explain why multiplication order matters",
    ],
    visualization: "matrix-multiplication",
    example: {
      prompt: "Apply a flip, then a quarter-turn, to [1, 0].",
      steps: ["The rightmost matrix acts first.", "Carry its output into the next matrix.", "Compare with reversing the order."],
      answer: "Matrix multiplication records a sequence of transformations from right to left.",
    },
  },
  {
    slug: "inner-products",
    title: "Inner Products",
    stage: "transform",
    estimatedMinutes: 30,
    summary: "Measure how strongly two vectors point in the same direction.",
    intuition: "The inner product is large for aligned arrows, zero for perpendicular arrows, and negative for opposing arrows.",
    quantumConnection: "Inner products produce transition amplitudes and tell us whether quantum states are orthogonal.",
    outcomes: [
      "Compute a real dot product",
      "Connect the result to angle and overlap",
      "Recognize orthogonal vectors",
    ],
    visualization: "inner-product",
    example: {
      prompt: "Compare a = [1, 0] with b = [0, 1].",
      steps: ["Multiply matching components.", "Add: 1×0 + 0×1 = 0."],
      answer: "Their inner product is 0, so the vectors are orthogonal.",
    },
  },
  {
    slug: "eigenvalues-eigenvectors",
    title: "Eigenvalues & Eigenvectors",
    stage: "transform",
    estimatedMinutes: 40,
    summary: "Find the special directions a matrix changes only in size.",
    intuition: "Most arrows turn under a transformation; an eigenvector stays on its line.",
    quantumConnection: "Observable eigenvectors are possible measurement states, and eigenvalues are the values that can be observed.",
    outcomes: [
      "Recognize the equation Av = λv",
      "Identify invariant directions visually",
      "Connect eigenvalues with scale factors",
    ],
    visualization: "eigenvector",
    example: {
      prompt: "Use A = [[2, 0], [0, 1]] on v = [1, 0].",
      steps: ["Multiply A by v to get [2, 0].", "Notice the direction did not change."],
      answer: "v is an eigenvector and its eigenvalue is λ = 2.",
    },
  },
  {
    slug: "probability",
    title: "Probability",
    stage: "predict",
    estimatedMinutes: 30,
    summary: "Describe uncertain outcomes with values that add up to one.",
    intuition: "Probability turns a set of possible results into a fair prediction of repeated experiments.",
    quantumConnection: "The Born rule squares amplitude magnitudes to produce measurement probabilities.",
    outcomes: [
      "Read probabilities as fractions and percentages",
      "Check that a distribution sums to 1",
      "Convert an amplitude into a probability",
    ],
    visualization: "probability",
    example: {
      prompt: "A state has amplitudes √0.7 and √0.3. What can measurement return?",
      steps: ["Square each amplitude magnitude.", "Check 0.7 + 0.3 = 1."],
      answer: "Outcome 0 has probability 70%; outcome 1 has probability 30%.",
    },
  },
  {
    slug: "tensor-products",
    title: "Tensor Products",
    stage: "predict",
    estimatedMinutes: 40,
    summary: "Combine smaller state spaces into one larger system.",
    intuition: "Pair every component of the first vector with every component of the second.",
    quantumConnection: "Two qubits need four amplitudes; n qubits need 2ⁿ amplitudes.",
    outcomes: [
      "Compute a tensor product of two 2D vectors",
      "Label the four two-bit basis states",
      "Explain exponential state-space growth",
    ],
    visualization: "tensor-product",
    example: {
      prompt: "Combine |0⟩ = [1, 0] and |1⟩ = [0, 1].",
      steps: ["Multiply 1 by both entries of [0, 1].", "Multiply 0 by both entries."],
      answer: "The result is [0, 1, 0, 0] = |01⟩.",
    },
  },
];

export function getMathLesson(slug: string): MathLessonRecord | undefined {
  return mathLessons.find((lesson) => lesson.slug === slug);
}

export function getMathLessonsByStage(stage: MathStageId): MathLessonRecord[] {
  return mathLessons.filter((lesson) => lesson.stage === stage);
}
