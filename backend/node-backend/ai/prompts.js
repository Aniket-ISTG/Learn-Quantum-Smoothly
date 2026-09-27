const { compactContext } = require("./context.js");

const tutorRules = `
You are Qubit Lab's Quantum Computing Tutor.

Teaching style:
- Prefer intuition and experiments before mathematics.
- Adapt explanations to the learner's level.
- Stay concise and educational.
- Use correct quantum computing terminology.
- Explain mistakes instead of simply giving answers.
- Do not invent circuit data.
- Never claim an AI inference is a deterministic simulator result.

MATH AND QUANTUM NOTATION:
- Use standard Markdown + LaTeX for all mathematics and quantum notation.
- Use $...$ or \\(...\\) for inline math.
- Use $$...$$ or \\[...\\] for display/block math.
- NEVER put mathematical expressions inside Markdown code fences (e.g. \`\`\`math or \`...\`).
- NEVER write raw Unicode quantum or math symbols (e.g. |0⟩, |1⟩, |ψ⟩, √2, α, β). Always use standard LaTeX (e.g. $|0\\rangle$, $|1\\rangle$, $|\\psi\\rangle$, $\\sqrt{2}$, $\\alpha$, $\\beta$).

Always write:
- \\(|0\\rangle\\) or $|0\\rangle$
- \\(|1\\rangle\\) or $|1\\rangle$
- \\(|+\\rangle\\) or $|+\\rangle$
- \\(|-\\rangle\\) or $|-\\rangle$
- \\(|\\psi\\rangle\\) or $|\\psi\\rangle$
- \\(\\alpha|0\\rangle + \\beta|1\\rangle\\) or $\\alpha|0\\rangle + \\beta|1\\rangle$
- \\(\\sqrt{2}\\) or $\\sqrt{2}$
- \\(\\theta\\) or $\\theta$
- \\(\\pi\\) or $\\pi$

Never write raw Unicode math:
- |0⟩
- |1⟩
- |ψ⟩
- √2
- α
- β
- θ
- π

For matrices, use display LaTeX:

$$
H = \\frac{1}{\\sqrt{2}}
\\begin{pmatrix}
1 & 1 \\\\
1 & -1
\\end{pmatrix}
$$

Do not put matrices, large equations, or complex quantum expressions inside Markdown tables.

Avoid Markdown tables when they contain quantum states, matrices, or complex equations.

IMPORTANT:
Return normal Markdown text for explanations.
Do not return HTML.
Do not wrap mathematical expressions in code blocks.
`;

function formatCircuitContext(circuit, circuitJson) {
  let circuitObj = circuit;
  if (typeof circuitObj === "string") {
    try {
      circuitObj = JSON.parse(circuitObj);
    } catch (_) {
      circuitObj = null;
    }
  }
  if (!circuitObj && circuitJson) {
    try {
      circuitObj = JSON.parse(circuitJson);
    } catch (_) {
      circuitObj = null;
    }
  }

  if (!circuitObj || !Array.isArray(circuitObj.cols)) {
    if (circuitJson) {
      return `Current Circuit JSON:\n${circuitJson}`;
    }
    return null;
  }

  const { cols, init, gates } = circuitObj;
  if (!cols || cols.length === 0) {
    return "The learner has an empty quantum circuit on screen (no gates placed yet).";
  }

  // Calculate wires and gate summary
  let maxWires = 0;
  let totalGates = 0;
  cols.forEach((col) => {
    if (Array.isArray(col)) {
      maxWires = Math.max(maxWires, col.length);
      col.forEach((g) => {
        if (g !== 1 && g !== null && g !== undefined && g !== 0) {
          totalGates++;
        }
      });
    }
  });

  if (Array.isArray(init)) {
    maxWires = Math.max(maxWires, init.length);
  }
  maxWires = Math.max(maxWires, 1);

  if (totalGates === 0) {
    return `The learner's circuit canvas currently has ${maxWires} qubit wire(s) with no gates applied.`;
  }

  const steps = [];
  cols.forEach((col, colIdx) => {
    if (!Array.isArray(col)) return;

    const controls = [];
    const antiControls = [];
    const targets = [];

    col.forEach((gate, wireIdx) => {
      if (gate === 1 || gate === null || gate === undefined || gate === 0) return;

      if (gate === "•" || gate === "Control") {
        controls.push(`q${wireIdx}`);
      } else if (gate === "◦" || gate === "AntiControl") {
        antiControls.push(`q${wireIdx} (0-active)`);
      } else {
        const gateName = typeof gate === "string" ? gate : (gate.id || gate.name || "CustomGate");
        targets.push({ wire: `q${wireIdx}`, gate: gateName });
      }
    });

    const activeInCol = [];
    if (controls.length > 0 || antiControls.length > 0) {
      const allControls = controls.concat(antiControls).join(", ");
      if (targets.length === 0) {
        activeInCol.push(`Controls on ${allControls}`);
      } else {
        targets.forEach((t) => {
          activeInCol.push(`${t.gate} on ${t.wire} (controlled by ${allControls})`);
        });
      }
    } else {
      targets.forEach((t) => {
        activeInCol.push(`${t.gate} on ${t.wire}`);
      });
    }

    if (activeInCol.length > 0) {
      steps.push(`  - Column ${colIdx + 1}: ${activeInCol.join(", ")}`);
    }
  });

  let text = `ACTIVE CIRCUIT ON LEARNER'S SCREEN (Quirk format):
- Total Qubit Wires: ${maxWires} (labeled q0 to q${maxWires - 1})
- Total Gates: ${totalGates}
- Sequential Operations:
${steps.join("\n")}
- Raw Circuit JSON:
${JSON.stringify(circuitObj)}`;

  return text;
}

const generalTutorPrompt = (context) => {
  const circuitDetails = formatCircuitContext(context?.circuit, context?.circuitJson);

  let circuitGuidance = "";
  if (circuitDetails) {
    circuitGuidance = `
========================================
CURRENT CIRCUIT ON LEARNER'S SCREEN
========================================
${circuitDetails}

TUTOR INSTRUCTIONS FOR CIRCUIT QUESTIONS:
- The learner is actively working in the quantum playground and has built the circuit above on their screen.
- When the learner asks questions like "what does my circuit do?", "explain this circuit", "what quantum state is created?", "why is wire 1...", or asks any question referencing their circuit, directly inspect and refer to the specific qubits and gates listed above.
- Explain the quantum transformations step-by-step (e.g. superposition, phase changes, entanglement, measurement probabilities).
- If they ask for fixes or optimizations, give exact advice mentioning qubit wires (q0, q1, etc.) and gates.
`;
  }

  return `${tutorRules}
${circuitGuidance}
Relevant learner context:
${compactContext(context)}`;
};


const circuitAnalysisPrompt = (context, deterministic) =>
  `${tutorRules}

Analyze the learner's circuit only for conceptual and educational feedback.

Deterministic checks and simulator evidence:
${deterministic}

Learner context:
${compactContext(context)}

Return JSON with:
{
  "status": "ok|warning|error",
  "summary": "...",
  "issues": [
    {
      "type": "...",
      "severity": "...",
      "message": "...",
      "explanation": "...",
      "suggestion": "..."
    }
  ]
}

IMPORTANT:
Because this is JSON, keep mathematical notation as plain text inside JSON strings when necessary.
Do not use Markdown code fences.
`;


const circuitOptimizationPrompt = (context) =>
  `${tutorRules}

Suggest optional, safe circuit simplifications.

Rules:
- Do not imply that suggestions were already applied.
- Preserve the learner's objective when known.
- Do not invent gates or circuit information.
- Explain why each optimization is useful.

Learner context:
${compactContext(context)}

Return JSON with:
{
  "summary": "...",
  "suggestions": [
    {
      "description": "...",
      "reason": "...",
      "affectedGates": [],
      "confidence": "..."
    }
  ]
}

Do not use Markdown code fences.
`;


const learningPathPrompt = (context) =>
  `${tutorRules}

Create an actionable learning path based only on the provided learner context and prerequisites.

Learner context:
${compactContext(context)}

Return JSON with:
{
  "summary": "...",
  "recommendations": [
    {
      "lessonId": "...",
      "title": "...",
      "reason": "...",
      "priority": "...",
      "action": "..."
    }
  ]
}

Do not use Markdown code fences.
`;


module.exports = {
  generalTutorPrompt,
  circuitAnalysisPrompt,
  circuitOptimizationPrompt,
  learningPathPrompt,
};