import {ObservableValue} from "../base/Obs.js"
import QuantumCircuit from "quantum-circuit";

const importsIsVisible = new ObservableValue(false);
const obsImportsIsShowing = importsIsVisible.observable().whenDifferent();
const closeImports = () => importsIsVisible.set(false);

/**
 * @param {!Revision} revision
 * @param {!ObservableValue.<!CircuitStats>} mostRecentStats
 * @param {!Observable.<!boolean>} obsIsAnyOverlayShowing
 */
function initImports(revision, mostRecentStats, obsIsAnyOverlayShowing) {
    const importCircuit = () => {
        // Due to horrors of Grunt, I have decided to include QuantumCircuit
        // in an external script tag. This is horrible, sorry. However, it works.
        const circuit = new QuantumCircuit();
        const type = document.getElementById("import-format-select").value;
        const input = document.getElementById("import-circuit-textarea").value;
        const error_message = document.getElementById("import-error-message");

        const setError = (message) => {
            error_message.textContent = message || "Import failed. Check the format and input.";
            error_message.style.display = "block";
        };

        if (!input || !input.trim()) {
            setError("Please paste a circuit before importing.");
            return;
        }

        let circuit_json = '{"cols":[]}';
        let parseError = null;

        try {
            if (type === "quirk-json") {
                JSON.parse(input);
                circuit_json = input;
            } else {
                const parseJsonInput = (label) => {
                    try {
                        return JSON.parse(input);
                    } catch (err) {
                        throw new Error(`Invalid ${label} JSON: ${err.message}`);
                    }
                };

                if (type === "QASM2.0") {
                    circuit.importQASM(input, (err) => {
                        throw new Error(Array.isArray(err) && err.length ? String(err[0]) : "Invalid OpenQASM input.");
                    });
                } else if (type === "QUIL2.0") {
                    circuit.importQuil(input, (err) => {
                        throw new Error(Array.isArray(err) && err.length ? String(err[0]) : "Invalid QUIL input.");
                    });
                } else if (type === "IONQ") {
                    circuit.importIonq(parseJsonInput("IONQ"), (err) => {
                        throw new Error(Array.isArray(err) && err.length ? String(err[0]) : "Invalid IONQ input.");
                    });
                } else if (type === "Qobj") {
                    circuit.importQobj(parseJsonInput("Qobj"), (err) => {
                        throw new Error(Array.isArray(err) && err.length ? String(err[0]) : "Invalid Qobj input.");
                    });
                } else {
                    throw new Error("Unsupported import format.");
                }

                circuit_json = JSON.stringify(circuit.exportQuirk());
            }

            revision.commit(circuit_json);
            importsIsVisible.set(false);
            error_message.style.display = "none";
        } catch (err) {
            parseError = err;
            setError(err && err.message ? err.message : "Import failed. Check the format and input.");
        }

        if (parseError) {
            console.warn("Import failed:", parseError);
        }
    }

    // Show/hide exports overlay.
    (() => {
        const openImports = /** @type {!HTMLButtonElement} */ document.getElementById('import-button');
        const importButton = /** @type {!HTMLButtonElement} */ document.getElementById('import-circuit-button');
        const importOverlay = /** @type {!HTMLDivElement} */ document.getElementById('import-overlay');
        const inputField /** @type {!HTMLDivElement} */ = document.getElementById("import-circuit-textarea");
        const importDiv = /** @type {HTMLDivElement} */ document.getElementById('import-div');
        openImports.addEventListener('click', () => importsIsVisible.set(true));
        obsIsAnyOverlayShowing.subscribe(e => { openImports.disabled = e; });
        importOverlay.addEventListener('click', () => importsIsVisible.set(false));
        importButton.addEventListener('click', () => importCircuit());
        document.addEventListener('keydown', e => {
            const ESC_KEY = 27;
            if (e.keyCode === ESC_KEY) {
                importsIsVisible.set(false)
            }
        });
        obsImportsIsShowing.subscribe(showing => {
            importDiv.style.display = showing ? 'block' : 'none';
            inputField.value = ""; // clear value on show & hide
            error_message.style.display = "none";
            if (showing) {
                document.getElementById('export-link-copy-button').focus();
            }
        });
    })();
}


export {initImports, closeImports}