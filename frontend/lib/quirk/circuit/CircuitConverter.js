import {HalfTurnGates} from "../gates/HalfTurnGates.js";
import {SwapGateHalf} from "../gates/SwapGateHalf.js";
import {CircuitDefinition} from "./CircuitDefinition.js";
import {GateColumn} from "./GateColumn.js"
import QuantumCircuit from "quantum-circuit";

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
        this.result = new QuantumCircuit();
        /** @type {!Number} */
        this.globalColumn = 0;
        /** @type {!CircuitDefinition} */
        this.circuit = circuit;
        /** @type {{string: Function}} */
        this.formats = {
            "QASM2.0": () => this.result.exportToQASM(),
            "Qiskit": () => this.result.exportToQiskit(),
            "PyQuil": () => this.result.exportToPyquil(),
            "Quil": () => this.result.exportToQuil(),
            "Cirq": () => this.result.exportToCirq(),
            "QuEST": () => this.result.exportToQuEST(),
            "QSharp": () => this.result.exportToQSharp(),
            "Qobj": () => JSON.stringify(this.result.exportToQobj()),
            "TFQ": () => this.result.exportToTFQ(),
            "Braket": () => this.result.exportToBraket(),
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
export {UnsupportedGateError, UnimplementedCircuitError};