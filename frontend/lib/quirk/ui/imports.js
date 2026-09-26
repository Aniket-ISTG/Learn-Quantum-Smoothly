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
        let type = document.getElementById("import-format-select").value;
        let input = document.getElementById("import-circuit-textarea").value;
        let error_message = document.getElementById("import-error-message");
        let error = false;
        
        if(!input) return;

        const handleImportError = (err) => {
            if(!Array.isArray(err) || !err.length) return;

            console.error(err);
            error = true;
        }
        
        let circuit_json = '{"cols":[]}';

        if(type != "quirk-json") {
            if(type == "QASM2.0") circuit.importQASM(input, handleImportError);
            if(type == "QUIL2.0") circuit.importQuil(input, handleImportError);
            if(type == "IONQ") circuit.importIonq(JSON.parse(input), handleImportError);
            if(type == "Qobj") circuit.importQobj(JSON.parse(input), handleImportError);
            circuit_json = JSON.stringify(circuit.exportQuirk());
        } else {
            circuit_json = input;
        }
        
        if(!error) {
            try {
                revision.commit(circuit_json);
                importsIsVisible.set(false);
            } catch(err) {
                error = true;
                console.error(err);
            }
        }
        error_message.style.display = error ? "block" : "none";
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
            if (showing) {
                document.getElementById('export-link-copy-button').focus();
            }
        });
    })();
}


export {initImports, closeImports}