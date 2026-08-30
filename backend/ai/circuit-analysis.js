function validateCircuit(circuit) {
  const issues = [];

  if (!Number.isInteger(circuit.qubits) || circuit.qubits < 1 || circuit.qubits > 10) {
    issues.push({
      type: "validation",
      severity: "high",
      message: "Unsupported qubit count",
      explanation: "The local learning simulator supports 1 to 10 qubits.",
      suggestion: "Set the circuit to a supported number of qubits.",
    });
  }

  circuit.moments.forEach((moment, momentIndex) => {
    moment.forEach((gate) => {
      if (gate.target < 0 || gate.target >= circuit.qubits) {
        issues.push({
          type: "validation",
          severity: "high",
          message: `${gate.type} targets an unavailable qubit`,
          explanation: `Moment ${momentIndex + 1} targets q${gate.target}, but the circuit has ${circuit.qubits} qubits.`,
          suggestion: "Choose an existing target qubit.",
        });
      }

      if (
        gate.type === "CNOT" &&
        (
          gate.control === undefined ||
          gate.control === gate.target ||
          gate.control < 0 ||
          gate.control >= circuit.qubits
        )
      ) {
        issues.push({
          type: "validation",
          severity: "high",
          message: "Invalid CNOT control/target pair",
          explanation: "A CNOT needs distinct, valid control and target qubits.",
          suggestion: "Assign two different existing qubits.",
        });
      }
    });
  });

  return issues;
}

function hasHadamardThenCnot(circuit) {
  const flat = circuit.moments.flat();
  return flat.some((gate) => gate.type === "H") && flat.some((gate) => gate.type === "CNOT");
}

module.exports = { validateCircuit, hasHadamardThenCnot };
