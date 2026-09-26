import {HalfTurnGates} from "../gates/HalfTurnGates.js";
import {SwapGateHalf} from "../gates/SwapGateHalf.js";
import {CircuitDefinition} from "./CircuitDefinition.js";
import {GateColumn} from "./GateColumn.js"
import QuantumCircuit from "quantum-circuit";

function normalizeExportCode(code) {
    if (typeof code !== "string") {
        return code;
    }

    return code
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/#\s*\/\/\/\s*script[\s\S]*?#\s*\/\/\/\s*/g, "");
}

function modernizeCirqExport(cirqCode) {
    if (typeof cirqCode !== "string") {
        return cirqCode;
    }

    let code = normalizeExportCode(cirqCode);

    code = code.replace(
        /q = \[cirq\.NamedQubit\('q' \+ str\(i\)\) for i in range\((\d+)\)\]/g,
        "q = cirq.LineQubit.range($1)"
    );

    code = code.replace(
        /q = \[cirq\.GridQubit\.rect\(1, (\d+)\)\]/g,
        "q = cirq.LineQubit.range($1)"
    );

    code = code.replace(
        /circuit = cirq\.Circuit\.from_ops\(/g,
        "circuit = cirq.Circuit("
    );

    code = code.replace(
        /circuit = cirq\.Circuit\(\s*([\s\S]*?)\s*\)/g,
        "circuit = cirq.Circuit($1)"
    );

    return code;
}

function modernizePennylaneExport(qiskitCode, options = {}) {
    if (typeof qiskitCode !== "string") {
        return qiskitCode;
    }

    const { shots = 1024 } = options;
    let code = normalizeExportCode(qiskitCode);

    const qubitsMatch = code.match(/QuantumRegister\s*\(\s*(\d+)\s*,\s*['"]q['"]\s*\)/) ||
        code.match(/qc\s*=\s*QuantumCircuit\s*\(\s*(\d+)\s*\)/);
    const qubitCount = qubitsMatch ? Number(qubitsMatch[1]) : 1;

    const operationRegex =
        /\bqc\.(h|x|y|z|s|sdg|t|tdg|cx|cy|cz|swap|ccx|rx|ry|rz|p|u|measure|reset|barrier)\s*\(([^)]*)\)/g;

    const operations = [];
    let match;

    while ((match = operationRegex.exec(code)) !== null) {
        const opName = match[1];
        const rawArgs = (match[2] || "").trim();
        const normalizedArgs = rawArgs
            .replace(/\bq\s*\[\s*(\d+)\s*\]/g, "$1")
            .replace(/\bc\s*\[\s*(\d+)\s*\]/g, "$1")
            .trim();

        if (["measure", "reset", "barrier"].includes(opName)) {
            continue;
        }

        const parts = normalizedArgs
            .split(",")
            .map(part => part.trim())
            .filter(Boolean);

        const wires = parts
            .filter(part => /^\d+$/.test(part))
            .map(Number);

        const params = parts.filter(part => !/^\d+$/.test(part));

        const wireExpr = wires.length > 1 ? `wires=[${wires.join(", ")}]` : `wires=${wires[0] ?? 0}`;

        const singleQubitMap = {
            h: "qml.Hadamard",
            x: "qml.PauliX",
            y: "qml.PauliY",
            z: "qml.PauliZ",
            s: "qml.S",
            sdg: "qml.adjoint(qml.S)",
            t: "qml.T",
            tdg: "qml.adjoint(qml.T)",
            p: `qml.PhaseShift`,
            rx: `qml.RX`,
            ry: `qml.RY`,
            rz: `qml.RZ`,
            u: `qml.U3`,
        };

        const twoQubitMap = {
            cx: "qml.CNOT",
            cy: "qml.CY",
            cz: "qml.CZ",
            swap: "qml.SWAP",
            ch: "qml.CH",
            ccx: "qml.Toffoli",
        };

        let line = "";

        if (twoQubitMap[opName]) {
            const [wireA, wireB] = wires;
            line = `${twoQubitMap[opName]}(wires=[${wireA}, ${wireB}])`;
        } else if (singleQubitMap[opName]) {
            const baseName = singleQubitMap[opName];
            if (["rx", "ry", "rz", "p", "u"].includes(opName)) {
                const param = params[0] || "0";
                if (opName === "u") {
                    const [theta, phi, lambdaValue] = params.length >= 3 ? params : ["0", "0", "0"];
                    line = `${baseName}(${theta}, ${phi}, ${lambdaValue}, wires=${wires[0] ?? 0})`;
                } else {
                    line = `${baseName}(${param}, wires=${wires[0] ?? 0})`;
                }
            } else if (opName === "sdg" || opName === "tdg") {
                line = `${baseName}(wires=${wires[0] ?? 0})`;
            } else {
                line = `${baseName}(${wireExpr})`;
            }
        } else {
            continue;
        }

        operations.push(line);
    }

    const output = [];
    output.push("import pennylane as qml");
    output.push("");
    output.push(`n_qubits = ${qubitCount}`);
    output.push('dev = qml.device("default.qubit", wires=n_qubits)');
    output.push("");
    output.push("@qml.qnode(dev)");
    output.push("def circuit():");

    if (operations.length) {
        for (const operation of operations) {
            output.push(`    ${operation}`);
        }
        output.push("    return qml.probs(wires=range(n_qubits))");
    } else {
        output.push("    return qml.state() ");
    }

    output.push("");
    output.push("print(circuit())");
    return output.join("\n") + "\n";
}

function modernizeQiskitExport(qiskitCode, options = {}) {
    if (typeof qiskitCode !== "string") {
        return qiskitCode;
    }

    const {
        includeBackend = true,
        shots = 1024
    } = options;

    let code = qiskitCode;

    // =========================================================
    // 1. Normalize escaped newlines
    // =========================================================

    code = code
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

    // =========================================================
    // 2. Remove PEP 723 metadata
    // =========================================================

    code = code.replace(
        /#\s*\/\/\/\s*script[\s\S]*?#\s*\/\/\/\s*/g,
        ""
    );

    // =========================================================
    // 3. Extract QuantumRegister / ClassicalRegister sizes
    // =========================================================

    const quantumMatch = code.match(
        /QuantumRegister\s*\(\s*(\d+)\s*,\s*['"]q['"]\s*\)/
    );

    const classicalMatch = code.match(
        /ClassicalRegister\s*\(\s*(\d+)\s*,\s*['"]c['"]\s*\)/
    );

    const qubits = quantumMatch
        ? Number(quantumMatch[1])
        : null;

    const classicalBits = classicalMatch
        ? Number(classicalMatch[1])
        : null;

    // =========================================================
    // 4. Extract QuantumCircuit
    // =========================================================

    let circuitMatch = code.match(
        /qc\s*=\s*QuantumCircuit\s*\(\s*([^)]*)\s*\)/
    );

    let circuitArgs = "";

    if (circuitMatch) {
        circuitArgs = circuitMatch[1].trim();
    }

    // If old registers existed, create the modern constructor
    if (qubits !== null) {
        circuitArgs =
            classicalBits !== null
                ? `${qubits}, ${classicalBits}`
                : `${qubits}`;
    }

    // =========================================================
    // 5. Extract all qc operations
    //
    // This is the important part.
    // It does NOT depend on newlines.
    // =========================================================

    const operations = [];

    const operationRegex =
        /\bqc\.(h|x|y|z|s|sdg|t|tdg|cx|cy|cz|swap|ch|ccx|rx|ry|rz|p|u|measure|reset|barrier)\s*\(([^)]*)\)/g;

    let match;

    while ((match = operationRegex.exec(code)) !== null) {
        let operation = match[1];
        let args = match[2];

        // q[0] -> 0
        args = args.replace(
            /\bq\s*\[\s*(\d+)\s*\]/g,
            "$1"
        );

        // c[0] -> 0
        args = args.replace(
            /\bc\s*\[\s*(\d+)\s*\]/g,
            "$1"
        );

        operations.push(
            `qc.${operation}(${args.trim()})`
        );
    }

    // =========================================================
    // 6. Build the Python file from scratch
    // =========================================================

    const output = [];

    // Imports
    output.push("from qiskit import QuantumCircuit");

    if (includeBackend) {
        output.push("from qiskit_aer import AerSimulator");
    }

    output.push("");

    // Circuit
    if (circuitArgs) {
        output.push(`qc = QuantumCircuit(${circuitArgs})`);
    } else if (qubits !== null) {
        output.push(`qc = QuantumCircuit(${qubits})`);
    } else {
        output.push("qc = QuantumCircuit()");
    }

    output.push("");
    output.push("qc.measure_all()");

    // Operations
    for (const operation of operations) {
        output.push(operation);
    }

    // Backend
    if (includeBackend) {
        output.push("");
        output.push("# Ideal simulator backend");
        output.push("backend = AerSimulator()");
        output.push(`job = backend.run(qc, shots=${shots})`);
        output.push("result = job.result()");
        output.push("print(result.get_counts(qc))");
    }

    return output.join("\n") + "\n";
}

class ModernQiskitCircuit extends QuantumCircuit {
    exportToQiskit(options = {}, exportAsGateName, circuitReplacement, insideSubmodule) {
        const generated = super.exportToQiskit(options, exportAsGateName, circuitReplacement, insideSubmodule);
        return modernizeQiskitExport(generated);
    }
}

class UnsupportedGateError extends Error { 
    constructor(msg) { 
        super(msg); 
        this.name = "UnsupportedGateError";
        this.message = msg;
    } 
}

class UnimplementedCircuitError extends Error {
    constructor(msg) { 
        super(msg); 
        this.name = "UnimplementedCircuitError";
        this.message = msg;
    } 
}

class CircuitConverter {
    /**
     * @param {!CircuitDefinition} circuit
     */
    constructor(circuit) {
        this.result = new ModernQiskitCircuit();
        /** @type {!Number} */
        this.globalColumn = 0;
        /** @type {!CircuitDefinition} */
        this.circuit = circuit;
        /** @type {{string: Function}} */
        this.formats = {
            "Qiskit": () => modernizeQiskitExport(this.result.exportToQiskit()),
            "Cirq": () => modernizeCirqExport(this.result.exportToCirq()),
            "PennyLane": () => modernizePennylaneExport(this.result.exportToQiskit()),
        }
    }
    
    /**
     * @throws {UnsupportedGateError}
     * @param {string} format 
     * @returns {string}
     */
    exportToFormat(format) {
        this.convertToJS(this.circuit);
        return this.formats[format]();
    }

    /**
     * @throws {UnsupportedGateError}
     * @param {CircuitDefinition} circuit
     */
    convertToJS(circuit) {
        circuit.columns.forEach(column => {
            const controls = this.findControls(column);
            console.log(column);
            
            this.invertAntiControlQubits(controls);

            switch(controls.length) {
                case 0: this.createUncontrolledColumn(column); break;
                case 1: this.createControlledColumn(column, controls[0][0]); break;
                case 2: this.createCCX(column, controls.map(ctrl => ctrl[0])); break;
                default:
                    throw new UnimplementedCircuitError("Too many controls found in a column.");
            }

            this.invertAntiControlQubits(controls);
        });
    }

    /** 
     * @param {!GateColumn} column
     * @returns {[[Number, boolean]]}
     */
    findControls(column) {
        const controls = [];

        column.gates.forEach((gate, wire) => {
            if(gate && gate.isControl()) controls.push([wire, !gate.controlBit()]);
        });

        return controls;
    }

    /**
     * @param {[[Number, boolean]]} controls 
     */
    invertAntiControlQubits(controls) {
        const inverted = controls.filter(ctrl => ctrl[1]);
        if(!inverted.length) return;
        
        inverted.map(ctrl => this.result.addGate("x", this.globalColumn, ctrl[0]));
        this.globalColumn += 1;
    }
    
    /**
     * @param {!GateColumn} column
     */
    createUncontrolledColumn(column) {
        this.createUncontrolledSwaps.call(this, column);
        column.gates.forEach((gate, wire) => {
            if(gate && gate.serializedId !== SwapGateHalf.serializedId &&
                !gate.definitelyHasNoEffect()) {
                
                if(gate.exportOptions) {
                    this.result.addGate(gate.exportOptions.uncontrolled, this.globalColumn,
                        wire, { params: gate.exportOptions.params });
                    this.globalColumn += 1;
                }
                else if(gate.knownCircuit) { // custom nested gate.
                    this.convertToJS(gate.knownCircuit);
                }
                else {
                    throw new UnsupportedGateError(`Found unsupported gate: ${gate.name}.`);
                }
            } 
        });
    }
    
    /**
     * @param {!GateColumn} column
     */
    createUncontrolledSwaps(column) {
        const isSwap = column.gates.map(gate =>
            (gate !== undefined && (gate.serializedId === SwapGateHalf.serializedId)));
        const nSwaps = isSwap.reduce((s, i) => s + i);  // total number of swap gates

        if(nSwaps === 2) this.result.addGate("swap", this.globalColumn,
            [isSwap.indexOf(true), isSwap.lastIndexOf(true)]);              
        else if(nSwaps !== 0) {
            throw new UnimplementedCircuitError(`A column may only contain 0 or 2 swap gates.`);
        }
    }
    
    /**
     * @param {!GateColumn} column
     * @param {!Number} control
     */
    createControlledColumn(column, control) {
        column.gates.forEach((gate, target) => {
            if(gate && !gate.isControl() && !gate.definitelyHasNoEffect()) {
                if(!gate.exportOptions || !gate.exportOptions.controlled) {
                    throw new UnsupportedGateError(`Found unsupported controlled gate: ${gate.name}.`);
                }
                
                this.result.addGate(gate.exportOptions.controlled, this.globalColumn,
                    [control, target], { params: gate.exportOptions.controlled_params });

                this.globalColumn += 1; // each control needs own column
            }
        });
    }
    
    /**
     * @param {!GateColumn} column
     * @param {![Number]} controls
     */
    createCCX(column, controls) {
        column.gates.forEach((gate, target) => {
            if(gate && !gate.isControl()) {
                if(gate.serializedId !== HalfTurnGates.X.serializedId) {
                    throw new UnimplementedCircuitError(`Found unsupported double-controlled gate: ${gate.name} (Only CCX is allowed)`);
                }
                
                this.result.addGate("ccx", this.globalColumn, [...controls, target]);
                this.globalColumn += 1; // we can have multiple X gates
            }
        });
    }
}

export default CircuitConverter;
export {UnsupportedGateError, UnimplementedCircuitError, ModernQiskitCircuit, modernizeQiskitExport, modernizeCirqExport, modernizePennylaneExport};